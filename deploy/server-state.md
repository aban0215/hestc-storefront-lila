# Server State Reference - One-Click Deployment

> Captured: 2026-05-10  
> Server: 47.253.227.7  
> Connection: root / ca%25fw3xt (SSH)

---

## 1. System Information

| Property | Value |
|---|---|
| OS | Ubuntu 22.04.5 LTS (Jammy Jellyfish) |
| Kernel | 5.15.0-174-generic x86_64 |
| Hostname | iZ0xi8rg5ymw4i2t6kdvshZ |
| Disk | 40G total, 7.2G used, 31G free (20%25 used) |
| Memory | 14Gi total, 1.1Gi used, 7.5Gi free, 13Gi available |
| Swap | None |
| Architecture | x86_64 |

## 2. Database Stack

### PostgreSQL
- Version: 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)
- Databases:
  - hestc_medusa (owner: hestc_admin)
  - hestc_strapi (owner: hestc_admin)
- Host: localhost:5432

### Redis
- Status: Active (running) at 127.0.0.1:6379

### Meilisearch
- Status: Running at http://127.0.0.1:7700

## 3. Node.js

| Tool | Version |
|---|---|
| Node.js | v20.20.2 |
| npm | 10.8.2 |
| pnpm | 10.33.4 |
| corepack | 0.34.6 |

Global npm: pm2@7.0.1, pnpm@10.33.4

## 4. PM2 Processes

| ID | Name | Status | Memory |
|---|---|---|---|
| 12 | medusa-backend | online | 91.9MB |
| 10 | strapi-cms | online | 3.5MB |

- medusa-backend cwd: /opt/hestc/hestc-medusa/apps/backend
- medusa-backend cmd: bash -c pnpm exec medusa start
- strapi-cms cmd: bash /tmp/sp.sh
- Startup: systemd service /etc/systemd/system/pm2-root.service
- PM2 home: /root/.pm2

## 5. Medusa Backend

- Path: /opt/hestc/hestc-medusa/apps/backend
- Package: @dtc/backend
- Medusa Version: 2.14.2
- Build: .medusa/server/ (symlinked as dist/)
- Modules: PayPal, Meilisearch, Translation

### .env
```
DATABASE_URL=postgres://hestc_admin:Hestc%25402024%2523Secure@localhost:5432/hestc_medusa
REDIS_URL=redis://localhost:6379
JWT_SECRET=HestcJwt@2024#Secret
COOKIE_SECRET=HestcCookie@2024#Secret
STORE_CORS=http://localhost:8000,https://abanopen.tech
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://abanopen.tech
AUTH_CORS=http://localhost:5173,http://localhost:9000,https://abanopen.tech
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_API_KEY=HestcMeili@2024#Master
MEDUSA_BACKEND_URL=https://abanopen.tech
NODE_ENV=production
```

## 6. Strapi CMS

- Path: /opt/hestc/hestc-strapi
- Package: hestc-strapi
- Strapi Version: 5.45.0
- Node engine: >=20.0.0 <=24.x.x

### .env
```
HOST=0.0.0.0
PORT=1337
APP_KEYS=HestcStrapiKey1@2024,HestcStrapiKey2@2024
API_TOKEN_SALT=HestcStrapiSalt@2024
ADMIN_JWT_SECRET=HestcStrapiAdmin@2024
TRANSFER_TOKEN_SALT=HestcStrapiTransfer@2024
JWT_SECRET=HestcStrapiJwt@2024
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=hestc_strapi
DATABASE_USERNAME=hestc_admin
DATABASE_PASSWORD=Hestc@2024#Secure
DATABASE_SSL=false
DATABASE_URL=postgres://hestc_admin:Hestc%25402024%2523Secure@localhost:5432/hestc_strapi
```

## 7. Nginx

- Status: Active
- Config: /etc/nginx/sites-available/default
- Block 1: abanopen.tech -> http://127.0.0.1:9000 (Medusa)
- Block 2: abanopencms.tech -> http://127.0.0.1:1337 (Strapi, 100M)
- SSL: /etc/nginx/ssl/abanopen.{crt,key} (TLSv1.2 TLSv1.3)

## 8. Security

- UFW: inactive (Alibaba Cloud security group)
- Aliyun Aegis running

## 9. Directory Structure

```
/opt/hestc/hestc-medusa/apps/backend/   Medusa 2.14.2
/opt/hestc/hestc-strapi/               Strapi 5.45.0
/etc/nginx/                            Nginx + SSL
/root/.pm2/                            PM2 state
```

## 10. Credentials

| Parameter | Value |
|---|---|
| SSH | root / ca%25fw3xt |
| DB user/pass | hestc_admin / Hestc@2024#Secure |
| Medusa DB | hestc_medusa |
| Strapi DB | hestc_strapi |
| JWT_SECRET | HestcJwt@2024#Secret |
| COOKIE_SECRET | HestcCookie@2024#Secret |
| Strapi ADMIN_JWT_SECRET | HestcStrapiAdmin@2024 |
| Meilisearch | HestcMeili@2024#Master |

## 11. Deployment Steps

1. cd /opt/hestc/hestc-medusa/apps/backend && medusa build
2. cd /opt/hestc/hestc-strapi && npm run build
3. pm2 restart medusa-backend
4. pm2 restart strapi-cms
5. nginx -t && systemctl reload nginx
6. pm2 save

## 12. Issues

1. Strapi uses /tmp/sp.sh (temp script)
2. Medusa err log points to NODE_ENV=production file
3. No ecosystem.config.js
4. UFW inactive

---
*Generated from files in /tmp/deploy-gather/*