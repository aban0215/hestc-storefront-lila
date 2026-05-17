import paramiko, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('47.253.227.7', username='root', password='ca%fw3xt', timeout=15)

# Step 1: Stop Medusa
print("=== Step 1: Stop Medusa ===")
stdin, stdout, stderr = client.exec_command('pm2 stop medusa-backend 2>&1 > /dev/null && echo STOPPED')
print(stdout.read().decode().strip())

# Step 2: Rebuild the project with latest config
print("\n=== Step 2: Rebuild Medusa ===")
stdin, stdout, stderr = client.exec_command(
    'cd /opt/hestc/hestc-medusa/apps/backend && pnpm run build 2>&1'
)
out = stdout.read().decode()
err = stderr.read().decode()
print('stdout:', out[:500])
if err:
    print('stderr:', err[:500])

# Step 3: Install production deps in .medusa/server/
print("\n=== Step 3: Install deps in .medusa/server/ ===")
stdin, stdout, stderr = client.exec_command(
    'cd /opt/hestc/hestc-medusa/apps/backend/.medusa/server && pnpm install 2>&1'
)
out = stdout.read().decode()
print(out[:500])

# Step 4: Link/copy .env to .medusa/server/
print("\n=== Step 4: Setup .env in .medusa/server/ ===")
stdin, stdout, stderr = client.exec_command(
    'cp /opt/hestc/hestc-medusa/apps/backend/.env /opt/hestc/hestc-medusa/apps/backend/.medusa/server/.env && echo COPIED'
)
print(stdout.read().decode().strip())

# Step 5: Update PM2 to run from .medusa/server/ with NODE_ENV=production
print("\n=== Step 5: Update PM2 config ===")
script = """
pm2 delete medusa-backend 2>/dev/null
pm2 start "pnpm exec medusa start" \
    --name medusa-backend \
    --cwd /opt/hestc/hestc-medusa/apps/backend/.medusa/server \
    --env production \
    -e "NODE_ENV=production"
echo "PM2 updated"
"""
stdin, stdout, stderr = client.exec_command(script)
out = stdout.read().decode()
print(out[:500])

# Wait for startup
print("\n=== Step 6: Wait for startup ===")
time.sleep(12)

# Step 7: Verify
print("\n=== Step 7: Verification ===")
checks = [
    ('PM2 status', 'pm2 jlist'),
    ('HTTPS health', 'curl -sk -o /dev/null -w "%{http_code}" https://localhost/health'),
    ('HTTPS app', 'curl -sk -o /dev/null -w "%{http_code}" https://localhost/app'),
    ('External health', 'curl -s -o /dev/null -w "%{http_code}" https://abanopen.tech/health'),
    ('External app', 'curl -s -o /dev/null -w "%{http_code}" https://abanopen.tech/app'),
    ('External login', 'curl -s -o /dev/null -w "%{http_code}" -X POST https://abanopen.tech/auth/user/emailpass -H "Content-Type: application/json" -d \'{"email":"admin@hestc-me.site","password":"Admin@2024#Hestc"}\''),
]

for name, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    if name == 'PM2 status':
        import json
        try:
            data = json.loads(out)
            for p in data:
                if p['name'] == 'medusa-backend':
                    env = p['pm2_env']
                    print(f"  Status: {env['status']}, cwd: {env.get('pm_cwd', '?')}")
                    print(f"  NODE_ENV: {env.get('env', {}).get('NODE_ENV', '?')}")
        except:
            print(out[:200])
    else:
        print(f"  {name}: {out.strip()}")

print("\n=== Done ===")
client.close()
