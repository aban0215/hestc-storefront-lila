import subprocess
import os

log = open(r"D:\Claude\storefront\dev-output.log", "w")

p = subprocess.Popen(
    [r"C:\nvm4w\nodejs\npm.cmd", "run", "dev"],
    cwd=r"D:\Claude\storefront",
    creationflags=0x00000008,  # DETACHED_PROCESS
    stdout=log,
    stderr=log,
)
print(f"Started with PID: {p.pid}")
