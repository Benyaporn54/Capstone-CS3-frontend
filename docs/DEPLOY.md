# Deploy (Frontend) ด้วย GitHub Actions

Flow: merge เข้า `main` → CI ผ่าน → build image → push `ghcr.io/<owner>/planit-frontend:sha-xxxxxxx` (ไม่ push `latest` ก่อนอนุมัติ — VM จะ tag `latest` ในเครื่องเอง) → **รอ Approve (Environment `production`)** → SSH เข้า VM → `docker pull` + `docker compose up -d --no-deps frontend` → health check (ถ้าไม่ผ่านจะ **rollback เป็น image เดิมอัตโนมัติ**)

Rollback: Actions → "Frontend CD" → Run workflow → ใส่ tag เก่า เช่น `sha-abc1234`

## ตั้งค่าครั้งเดียว (Settings ของ repo นี้)

1. **Environments → New → `production`** เปิด _Required reviewers_ (ใส่คนที่มีสิทธิ์อนุมัติ) และจำกัด _Deployment branches_ เป็น `main`
2. **Secrets** (ใส่ใน environment `production`):
   | Secret           | ค่า                                                                                                 |
   | ---------------- | --------------------------------------------------------------------------------------------------- |
   | `VM_HOST`        | hostname/IP ของ VM                                                                                  |
   | `VM_USER`        | user สำหรับ deploy (ไม่ใช่ root, อยู่ในกลุ่ม docker)                                                |
   | `VM_SSH_KEY`     | private key เฉพาะ deploy (`ssh-keygen -t ed25519`) ใส่ public key ใน `~/.ssh/authorized_keys` บน VM |
   | `VM_KNOWN_HOSTS` | ผลจาก `ssh-keyscan -t ed25519 <host>` (ตรวจ fingerprint ให้ตรงกับ VM จริง)                          |
   | `VM_PORT`        | (ไม่บังคับ) default 22                                                                              |
3. **Variables:** `DEPLOY_PATH` (default `/opt/planit`), `FRONTEND_SERVICE` (ชื่อ service ใน compose, default `frontend`), `FRONTEND_HEALTH_URL` (**บังคับ** — ถ้าไม่ตั้ง job จะล้มเหลว)
4. **บน VM:** service ใน `docker-compose.yml` ต้องใช้ `image: ghcr.io/<owner>/planit-frontend:latest` ส่วนค่า secret ของแอปอยู่ใน `.env` บน VM (`chmod 600`) ห้าม commit
5. แพ็กเกจ GHCR ครั้งแรกจะเป็น private — workflow login ชั่วคราวด้วย `GITHUB_TOKEN` เพื่อ pull แล้ว logout ให้ จึงไม่ต้องใช้ PAT

## ความปลอดภัย

- CD รันเฉพาะ CI ของ `push` บน main (ไม่รับ PR/fork) — repo public ห้ามเปิดให้ PR จาก fork ถึง secrets
- ควรจำกัดสิทธิ์ SSH key ด้วย `command=`/user ที่รัน docker ได้อย่างเดียว

อ้างอิง: [Environments](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment) · [Secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) · [GHCR](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
