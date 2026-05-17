import paramiko, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('47.253.227.7', username='root', password='ca%fw3xt', timeout=10)

# Write nginx config using shell heredoc
script = r'''
cat > /etc/nginx/sites-available/default << 'HEREDOC_END'
# Medusa Backend - abanopen.tech
server {
    listen 80;
    listen 443 ssl;
    server_name abanopen.tech;

    ssl_certificate /etc/nginx/ssl/abanopen.crt;
    ssl_certificate_key /etc/nginx/ssl/abanopen.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }
}

# Strapi CMS - abanopencms.tech
server {
    listen 80;
    listen 443 ssl;
    server_name abanopencms.tech;

    ssl_certificate /etc/nginx/ssl/abanopen.crt;
    ssl_certificate_key /etc/nginx/ssl/abanopen.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }
}
HEREDOC_END
echo "DONE"
'''

stdin, stdout, stderr = client.exec_command(script)
out = stdout.read().decode()
print('Write:', out.strip())

# Test nginx config
stdin, stdout, stderr = client.exec_command('nginx -t 2>&1')
print('Nginx test:', stdout.read().decode())

# Reload
stdin, stdout, stderr = client.exec_command('nginx -s reload 2>&1 && echo ok')
print('Reload:', stdout.read().decode())

time.sleep(1)

# Verify HTTPS
stdin, stdout, stderr = client.exec_command('curl -sk -o /dev/null -w "%{http_code}" https://127.0.0.1/health')
print('HTTPS health:', stdout.read().decode())

stdin, stdout, stderr = client.exec_command('curl -sk -o /dev/null -w "%{http_code}" https://127.0.0.1/app')
print('HTTPS app:', stdout.read().decode())

# Verify nginx config contains the variables
stdin, stdout, stderr = client.exec_command('grep -c "http_upgrade" /etc/nginx/sites-available/default')
count = stdout.read().decode().strip()
print(f'http_upgrade count: {count}')

client.close()
