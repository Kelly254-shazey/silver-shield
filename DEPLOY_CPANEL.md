# Silver Shield cPanel Production Deployment

## 1. Architecture

- `backend/`: Node.js API (`/api/*`) + Socket.IO + MySQL.
- `frontend/`: Vite React SPA (static files in `frontend/dist`).

Recommended production layout:

- Frontend: `https://your-domain.com` (served from `public_html`).
- Backend API: `https://api.your-domain.com/api` (Node.js App in cPanel).

## 2. Backend (cPanel Node.js App)

1. Create a subdomain for API (example: `api.your-domain.com`).
2. In cPanel, open **Setup Node.js App** and create an app:
   - Node version: latest available LTS.
   - Application mode: `Production`.
   - Application root: folder where `backend/` is uploaded.
   - Application URL: your API subdomain.
   - Application startup file: `src/server.js`.
3. Open Terminal in cPanel and install dependencies:
   - `cd ~/path-to/backend`
   - `npm install --omit=dev`
4. Create `backend/.env` from `backend/.env.example` and set real values.
5. Restart the Node.js app from cPanel.

Required backend env highlights:

- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com`
- `JWT_SECRET=<long-random-secret>`
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `MPESA_*` production credentials
- `PAYPAL_*` live credentials (if PayPal is enabled)

## 3. Frontend (Static Site on cPanel)

1. In `frontend/`, create `.env.production` from `frontend/.env.production.example`.
2. Set:
   - `VITE_API_BASE_URL=https://api.your-domain.com/api`
3. Build frontend:
   - `cd frontend`
   - `npm install`
   - `npm run build`
4. Upload contents of `frontend/dist/` to `public_html/`.

Notes:

- `frontend/public/.htaccess` is included and copied to `dist/` during build.
- This `.htaccess` enables SPA routing so direct URLs like `/donate` do not 404.

## 4. Database Setup

1. Create MySQL database and user in cPanel.
2. Grant all required privileges to the app user.
3. Put those credentials in `backend/.env`.
4. Run your seed/init process only once if required:
   - `node src/scripts/seed.js`

## 5. Post-Deploy Checks

1. API health:
   - `https://api.your-domain.com/api/health`
2. Frontend pages:
   - `/`
   - `/donate`
   - `/programs`
3. CORS:
   - Browser requests from `your-domain.com` to API should succeed.
4. Donations:
   - Test M-Pesa STK flow with production callback URL.
5. Logs:
   - Check cPanel Node app logs for startup/runtime errors.

## 6. Security Checklist

- Use strong secrets (`JWT_SECRET`, DB password, admin password).
- Keep `.env` out of git.
- Set least-privilege DB permissions.
- Use HTTPS for both frontend and API domains.
