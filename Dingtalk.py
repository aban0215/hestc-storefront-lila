#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OpenClaw 任务监控 + 钉钉单聊实时通知脚本
适用：OpenClaw 2.1.148 + Agent SDK 0.3.148 + 钉钉企业内部应用机器人（单聊）

用法：
  1. 填写底部配置区 APP_KEY / APP_SECRET / USER_ID
  2. 确认 LOG_DIR 路径（默认 /tmp/openclaw）
  3. 运行：python monitor_openclaw_single.py
  4. 后台运行：nohup python monitor_openclaw_single.py > monitor.log 2>&1 &

依赖：pip install requests
"""

import os
import sys
import re
import json
import time
import requests
import threading
import signal
from pathlib import Path
from datetime import datetime

# ================= 配置区（请修改） =================
APP_KEY = os.getenv("DINGTALK_APP_KEY", "dingqjfjoq2sgdervgiq")          # 钉钉应用 AppKey
APP_SECRET = os.getenv("DINGTALK_APP_SECRET", "q4LIhXzY_NLAA1gaRQmbpMbE_ATACUGbEd1wKub0HJ_QH6-fE7sx3UufDZWyRkI3")     # 钉钉应用 AppSecret
USER_ID = os.getenv("DINGTALK_USER_ID", "0226140138751061")            # 你的钉钉 userid（非手机号）
PUSH_INTERVAL = float(os.getenv("PUSH_INTERVAL", "4.5"))           # 推送间隔（秒），≥4.5 防限频
LOG_DIR = os.getenv("OPENCLAW_LOG_DIR", "/tmp/openclaw")           # OpenClaw 日志目录
LOCAL_LOG = os.getenv("LOCAL_LOG", "monitor.log")                  # 本地日志文件
# ====================================================

class DingTalkSingleNotifier:
    """钉钉单聊推送器（企业内部应用）"""

    def __init__(self, app_key, app_secret, user_id, push_interval):
        self.app_key = app_key
        self.app_secret = app_secret
        self.user_id = user_id
        self.push_interval = push_interval
        self.robot_code = app_key  # 单聊 robotCode = AppKey

        self.access_token = None
        self.token_expire_time = 0
        self.buffer = []
        self.last_push_time = 0
        self.lock = threading.Lock()
        self.reported_steps = set()
        self.running = True

        # 初始化获取 Token
        self._get_access_token()

    def _get_access_token(self):
        """获取/刷新 AccessToken（有效期 2 小时）"""
        url = "https://api.dingtalk.com/v1.0/oauth2/accessToken"
        payload = {"appKey": self.app_key, "appSecret": self.app_secret}
        try:
            resp = requests.post(url, json=payload, timeout=10)
            data = resp.json()
            if resp.status_code == 200 and "accessToken" in data:
                self.access_token = data["accessToken"]
                # expireIn 单位秒，提前 5 分钟刷新
                self.token_expire_time = time.time() + data.get("expireIn", 7200) - 300
                return self.access_token
            raise RuntimeError(f"获取 AccessToken 失败: {data}")
        except Exception as e:
            print(f"[ERROR] Token 请求异常: {e}", file=sys.stderr)
            return None

    def _ensure_token(self):
        """Token 保活检查"""
        if self.access_token and time.time() < self.token_expire_time:
            return self.access_token
        return self._get_access_token()

    def _send_api(self, content: str):
        """调用钉钉单聊发送接口"""
        token = self._ensure_token()
        if not token:
            return
        url = "https://api.dingtalk.com/v1.0/robot/oToMessages/batchSend"
        headers = {"x-acs-dingtalk-access-token": token}
        payload = {
            "robotCode": self.robot_code,
            "userIds": [self.user_id],
            "msgKey": "sampleMarkdown",
            "msgParam": json.dumps({
                "title": "🔧 OpenClaw 任务进度",
                "text": content
            }, ensure_ascii=False)
        }
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=10)
            res = resp.json()
            if not res.get("success"):
                print(f"[WARN] 钉钉推送失败: {res}", file=sys.stderr)
        except Exception as e:
            print(f"[WARN] 请求异常: {e}", file=sys.stderr)

    def push(self, step_name: str, detail: str = ""):
        """推送进度（带缓冲 + 限流 + 去重）"""
        with self.lock:
            if not self.running:
                return
            now = time.time()
            # 阶段去重：同一阶段短时间不重复推
            if step_name in self.reported_steps and (now - self.last_push_time < self.push_interval * 2):
                return
            self.reported_steps.add(step_name)

            # 格式化消息
            msg = f"**🔹 {step_name}**\n`{time.strftime('%H:%M:%S')}`\n{detail}"
            self.buffer.append(msg)

            # 限流触发
            if now - self.last_push_time >= self.push_interval:
                self._flush()

    def _flush(self):
        """发送缓冲消息"""
        if not self.buffer or not self.running:
            return
        # 保留最新 3 条，防止消息过长
        content = "\n---\n".join(self.buffer[-3:])
        self._send_api(content)
        self.buffer = []
        self.last_push_time = time.time()

    def finish(self, success: bool = True):
        """发送完成通知"""
        with self.lock:
            if self.buffer:
                self._flush()
            self.running = False
        status = "✅" if success else "❌"
        self._send_api(f"{status} **任务已执行完毕**\n🕒 `{time.strftime('%H:%M:%S')}`\n📂 请检查生成文件。")

    def stop(self):
        """优雅停止"""
        self.finish(success=False)


# ================= 日志解析规则（适配 OpenClaw JSONL） =================
STEP_RULES = [
    # 📥 数据拉取阶段
    (
        "📥 数据拉取阶段",
        r'"text"[^}]*?(?:fetch|download|pull|ingest|Rainforest|ASIN|product.*json|loaded \d+ products|extracted \d+ category)'
    ),
    # 🌐 调用三方 API
    (
        "🌐 调用三方 API",
        r'"name"[^}]*?(?:read|write|exec|message|api_call|Rainforest|bailian|strapi|medusa)|'
        r'"text"[^}]*?(?:POST|GET|request|response|200|timeout|api\.|http[s]?://)'
    ),
    # 📄 生成结果文件
    (
        "📄 生成结果文件",
        r'"text"[^}]*?(?:saved|write|generate|build-data\.json|products\.json|taxonomy|categories-collections|✅|assembled)'
    ),
    # ⚠️ 捕获异常
    (
        "⚠️ 捕获异常",
        r'"logLevelName"[^}]*?"ERROR"|'
        r'"text"[^}]*?(?:error|fail|exception|ENOENT|terminated|not found|access denied|40[0-9]|50[0-9])'
    ),
    # ✅ 阶段完成
    (
        "✅ 阶段完成",
        r'"text"[^}]*?(?:phase \d+\.?\d*.*complete|✅|finished|done|all steps passed)'
    ),
]

def match_step(json_line: str):
    """解析 OpenClaw JSONL 日志，返回 (阶段名, 详情)"""
    try:
        data = json.loads(json_line.strip())
    except json.JSONDecodeError:
        return None, None
    except Exception:
        return None, None

    # 1. 优先匹配 toolCall（工具调用 = 明确动作）
    if data.get("type") == "toolCall":
        tool_name = data.get("name", "")
        args = data.get("arguments", {})
        detail = f"工具调用: {tool_name}({json.dumps(args, ensure_ascii=False)[:80]}...)"
        if tool_name in ("read", "fetch", "download"):
            return "📥 数据拉取阶段", detail
        elif tool_name in ("exec", "api_call", "message"):
            return "🌐 调用三方 API", detail
        elif tool_name in ("write", "save", "generate"):
            return "📄 生成结果文件", detail

    # 2. 匹配 message 中的 text 内容
    content = data.get("content", [])
    if isinstance(content, list):
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                text = item.get("text", "")
                for step_name, pattern in STEP_RULES:
                    if re.search(pattern, text, re.IGNORECASE):
                        snippet = text.strip()[:150] + ("..." if len(text)>150 else "")
                        return step_name, snippet

    # 3. 匹配顶层错误字段
    if data.get("logLevelName") == "ERROR":
        err_msg = data.get("0", "") or data.get("message", "")
        return "⚠️ 捕获异常", err_msg[:150]

    return None, None


# ================= 文件监控 =================
def get_latest_log(dir_path: str) -> str:
    """获取 LOG_DIR 中最新的 openclaw-*.log 文件"""
    logs = sorted(Path(dir_path).glob("openclaw-*.log"), key=lambda p: p.stat().st_mtime, reverse=True)
    return str(logs[0]) if logs else None

def tail_jsonl(filepath: str, callback, stop_event: threading.Event):
    """监控 JSONL 文件新增行，逐行解析并回调"""
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            f.seek(0, 2)  # 跳到文件末尾
            while not stop_event.is_set():
                line = f.readline()
                if not line:
                    time.sleep(0.3)  # 无新日志时短眠
                    continue
                try:
                    step, detail = match_step(line)
                    if step:
                        callback(step, detail)
                except Exception as e:
                    print(f"[WARN] 解析日志失败: {e}", file=sys.stderr)
    except FileNotFoundError:
        print(f"[ERROR] 日志文件不存在: {filepath}", file=sys.stderr)
    except Exception as e:
        print(f"[ERROR] 监控异常: {e}", file=sys.stderr)


# ================= 本地日志 =================
def log_local(msg: str):
    """追加写入本地日志"""
    try:
        with open(LOCAL_LOG, "a", encoding="utf-8") as f:
            f.write(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} {msg}\n")
    except:
        pass


# ================= 主函数 =================
def main():
    # 信号处理：Ctrl+C 优雅退出
    stop_event = threading.Event()
    def signal_handler(sig, frame):
        print("\n⛔ 收到中断信号，正在退出...")
        stop_event.set()
        if 'notifier' in globals():
            notifier.stop()
        sys.exit(0)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    log_local("=== 监控启动 ===")

    # 1. 初始化通知器
    global notifier
    notifier = DingTalkSingleNotifier(APP_KEY, APP_SECRET, USER_ID, PUSH_INTERVAL)
    notifier.push("🚀 任务监控启动", f"日志目录: {LOG_DIR}")

    # 2. 获取最新日志文件
    log_file = get_latest_log(LOG_DIR)
    if not log_file:
        msg = f"❌ 未找到日志文件，请检查目录: {LOG_DIR}"
        print(msg, file=sys.stderr)
        notifier.finish(success=False)
        return
    log_local(f"监控日志: {log_file}")
    print(f"📁 监控中: {log_file}")

    # 3. 启动文件监控线程
    monitor_thread = threading.Thread(
        target=tail_jsonl,
        args=(log_file, notifier.push, stop_event),
        daemon=True
    )
    monitor_thread.start()

    # 4. 主循环：检测日志文件是否滚动（新一天）
    current_file = log_file
    while not stop_event.is_set():
        time.sleep(10)  # 每 10 秒检查一次
        latest = get_latest_log(LOG_DIR)
        if latest and latest != current_file:
            log_local(f"日志文件滚动: {current_file} → {latest}")
            current_file = latest
            # 重启监控线程
            monitor_thread.join(timeout=2)
            monitor_thread = threading.Thread(
                target=tail_jsonl,
                args=(current_file, notifier.push, stop_event),
                daemon=True
            )
            monitor_thread.start()
            notifier.push("📁 日志文件更新", f"切换至: {Path(current_file).name}")

    # 5. 正常退出
    notifier.finish(success=True)
    log_local("=== 监控结束 ===")


if __name__ == "__main__":
    # 检查配置
    if APP_KEY == "dingXXXXXXXXXX" or APP_SECRET == "XXXXXXXXXXXXX" or USER_ID == "manager12345":
        print("❌ 请编辑脚本，填写真实的 APP_KEY / APP_SECRET / USER_ID", file=sys.stderr)
        sys.exit(1)

    main()