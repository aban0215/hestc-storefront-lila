# 已完成的自动化任务

## 1. 前端菜单三级渲染修复

**触发条件**：导航栏显示 2 个重复 WOMEN、1 个 MEN，子菜单只到第 2 层，缺少第 3 层

**执行步骤**：

1. 删除 Strapi 脏数据 id=5（空的 Women 条目，documentId=`q7laxzcxyncgnf1jj7j2qsgw`）
   ```bash
   curl -s -X DELETE "http://localhost:1337/content-manager/collection-types/api::lila-menu-item.lila-menu-item/q7laxzcxyncgnf1jj7j2qsgw" \
     -H "Authorization: Bearer $JWT"
   ```

2. 修复 `buildMenuTree` 递归 — 将原来只构建 1 层 children 改为递归填充所有层级

3. 修复 API 请求分页 — `getMenuData` 的 fetch URL 加 `pagination[pageSize]=100`

**产出结果**：
- `src/modules/layout/templates/nav/index.tsx` — `buildMenuTree` 递归版本，`getMenuData` 带分页参数
- 前端导航显示 4 个主菜单（Women、Men、Kids、Home & Living），各含 2 个子类 × 5 个三级项

---

## 2. Strapi 菜单模型增加字段（link_type + medusaHandle + slug）

**触发条件**：菜单需要 `link_type` 用于前端路由跳转（category→/categories/$, collection→/collections/$, blog→/blog），`medusaHandle` 用于匹配 Medusa 产品数据的 handle 值

**执行步骤**：

1. SSH 到服务器，停止 Strapi
   ```bash
   pm2 stop hestc-strapi
   ```

2. 手动更新 schema.json（Content-Type Builder API 在生产模式 disabled）
   ```bash
   # 编辑服务器文件
   vim /opt/hestc/hestc-strapi/src/api/lila-menu-item/content-types/lila-menu-item/schema.json
   ```
   新增字段：
   ```json
   "link_type": {"type": "enumeration", "enum": ["category", "collection", "blog", "page"], "default": "category"},
   "medusaHandle": {"type": "string"},
   "slug": {"type": "string"}
   ```

3. PostgreSQL 手动添加列（Strapi 重启时不会自动加列）
   ```sql
   ALTER TABLE lila_menuitems ADD COLUMN link_type VARCHAR(255);
   ALTER TABLE lila_menuitems ADD COLUMN medusa_handle VARCHAR(255);
   ALTER TABLE lila_menuitems ADD COLUMN slug VARCHAR(255);
   ```

4. 重建 + 重启
   ```bash
   cd /opt/hestc/hestc-strapi && npm run build && pm2 restart hestc-strapi
   ```

5. 验证字段生效：通过 Content-Manager API 创建带新字段的测试条目

**产出结果**：
- Strapi `lila-menu-item` Content Type 新增 3 个字段
- 数据库 `lila_menuitems` 表共 15 列
- 公共 API `https://abanopencms.tech/api/lila-menuitems` 返回包含 `link_type`, `medusaHandle`, `slug` 字段

---

## 3. 菜单数据录入脚本（create-menus.py）

**触发条件**：旧脚本 `create-menu-items.sh` 通过 bash + curl + python3 混合调用，shell 转义导致 JSON 损坏，字段校验失败

**执行步骤**：

1. 本地编写 `create-menus.py`（Python urllib 直连 Strapi API，零 shell 转义）
2. SFTP 二进制上传到服务器
3. 服务器直接执行：
   ```bash
   python3 /tmp/create-menus.py
   ```

脚本流程：
- `POST /admin/login` 获取 JWT
- `GET /content-manager/collection-types/...?pageSize=100` 查现有条目
- `DELETE` 逐个清除
- `POST` 递归创建 4 主菜单 × 2 子类 × 5 三级项 = 52 条数据
- `GET` 验证最终结果

**产出结果**：
- `D:\Claude\storefront\create-menus.py` — 可复用数据录入脚本
- 52 条菜单项全部创建成功，含 `title`, `slug`, `url`, `link_type`, `medusaHandle`, `order`, `visible`, `locale`, `parent` 关系

---

## 4. Nginx 反向代理配置

**触发条件**：前端通过域名访问 Medusa 和 Strapi 需要 HTTPS 反向代理

**执行步骤**：

通过 Python paramiko SSH 写入 `/etc/nginx/sites-available/default`：
```nginx
# Medusa Backend - abanopen.tech → proxy_pass http://127.0.0.1:9000
# Strapi CMS - abanopencms.tech → proxy_pass http://127.0.0.1:1337
```
含 SSL 证书、WebSocket upgrade、CORS headers

```bash
nginx -t && nginx -s reload
```

**产出结果**：
- `D:\Claude\storefront\fix-nginx.py` — Nginx 配置部署脚本
- `https://abanopen.tech/health` 返回 200
- `https://abanopencms.tech/api/lila-menuitems` 返回菜单数据

---

## 5. Medusa 生产模式部署修复

**触发条件**：Medusa build 后 PM2 指向错误的目录，NODE_ENV 未设 production

**执行步骤**：

通过 Python paramiko SSH 执行：
1. `pm2 stop medusa-backend`
2. `pnpm run build`
3. 在 `.medusa/server/` 执行 `pnpm install`
4. 复制 `.env` 到 `.medusa/server/`
5. 更新 PM2 启动命令：
   ```bash
   pm2 start "pnpm exec medusa start" --name medusa-backend \
     --cwd /opt/hestc/hestc-medusa/apps/backend/.medusa/server \
     --env production -e "NODE_ENV=production"
   ```
6. 验证 `/health`, `/app`, `/auth/user/emailpass` 均返回正常

**产出结果**：
- `D:\Claude\storefront\fix-production-deploy.py` — 生产部署修复脚本
- Medusa 在生产模式正常运行，API 可访问

---

# 核心配置和文件

| 文件 | 路径 | 说明 |
|---|---|---|
| **前端导航主组件** | `src/modules/layout/templates/nav/index.tsx` | `getMenuData()` + `buildMenuTree()` 递归版 |
| **导航下拉客户端组件** | `src/modules/layout/templates/nav/NavLinks.tsx` | `getMenuHref(linkType, slug)` 路由分发 |
| **Strapi 客户端库** | `src/lib/strapi.ts` | `getStrapiData()` / `getStrapiSingle()`，locale 默认 `en-US` |
| **菜单数据录入脚本** | `create-menus.py` | Python urllib 直连，52 条数据，可复用 |
| **菜单模型更新脚本** | `update-menu-model.py` | SSH + schema.json PUT + 字段添加（历史记录） |
| **Nginx 部署脚本** | `fix-nginx.py` | 写入 Nginx 配置 + reload |
| **Medusa 部署修复脚本** | `fix-production-deploy.py` | PM2 生产模式启动 |
| **Strapi schema（服务器）** | `/opt/hestc/hestc-strapi/src/api/lila-menu-item/content-types/lila-menu-item/schema.json` | 含 3 个新字段定义 |
| **Nginx 配置（服务器）** | `/etc/nginx/sites-available/default` | Medusa :9000 + Strapi :1337 |
| **PostgreSQL（服务器）** | `hestc_strapi` 库 `lila_menuitems` 表 | 15 列，含 `link_type`, `medusa_handle`, `slug` |
| **前端环境变量** | `.env.local` | `NEXT_PUBLIC_STRAPI_API_URL=https://abanopencms.tech` |

# 已知的坑和解决方案

1. **Strapi v5 Content-Type Builder 在生产模式 disabled** → 直接编辑服务器 `schema.json` + PostgreSQL 手动加列 + `npm run build` 重启
2. **数据库列存在但 Strapi API 不识别新字段** → 必须 `npm run build` 重新编译 schema，重启后 content-manager metadatas 才自动更新
3. **Bash + curl + python3 嵌套 JSON 转义地狱** → 改用 Python urllib 直连 API，脚本 SFTP 上传到服务器直接执行
4. **Strapi enum 校验："page" 值被 API 拒绝**（schema.json 有但运行时 schema 未更新） → 暂用 "category" 作为顶级菜单 link_type，后续可通过管理后台调整
5. **Windows GBK 编码无法打印 Strapi/PM2 输出中的 emoji** → 服务器端输出重定向到文件，SFTP 二进制读取
6. **Strapi 默认分页 25 条，前端只拿到 1/3 数据** → API URL 加 `pagination[pageSize]=100`
7. **前端 locale 默认 'en'，Strapi 数据是 'en-US'** → `strapi.ts` 默认值改为 `'en-US'`
8. **`buildMenuTree` 只构建 1 层 children，第 3 层不渲染** → 改为递归 `children: buildChildren(child.id)`
9. **脏数据 id=5 空 Women 条目导致重复显示** → 通过 Content-Manager API DELETE 删除
10. **PM2 启动目录指向项目根而非 `.medusa/server/`** → 修改 PM2 `--cwd` 到编译输出目录，复制 `.env`

# 待办/未完成的任务

- **顶级菜单 link_type 调整**：当前所有 52 条 link_type 为 "category"，前端 `getMenuHref("category", "women")` 会路由到 `/categories/women` 而非 `/women`。需在 Strapi 管理后台将顶级菜单的 link_type 改为 "page"，或在前端 `getMenuHref` 里添加 "page" 分支
- **Medusa 商品数据**：Medusa 当前 collections=0，medusaHandle（如 "dresses", "women-clothing" 等）对应的 Medusa 集合/分类尚未创建
- **Meilisearch API Key 配置**
- **`src/lib/strapi/header-data.ts`** 是死代码，未被任何文件 import，可清理
