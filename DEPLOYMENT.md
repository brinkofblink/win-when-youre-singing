# Production Deployment Guide

## Render.com (Recommended - Free)

### Setup:

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Use these settings:
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Add `NODE_ENV=production`

### Environment Variables:

- `NODE_ENV=production` (required)
- `CLIENT_URL=https://your-app-name.onrender.com` (optional, for CORS)

### Free Tier Limits:

- 750 hours/month (enough for 24/7)
- App sleeps after 15 minutes of inactivity
- 512MB RAM, 0.1 CPU

---

## Digital Ocean + Laravel Forge

### Setup:

1. Create a $6/month DO droplet via Forge
2. Install Node.js on the server
3. Clone your repo to the server
4. Run the production build:

```bash
# On your server
git clone your-repo
cd win-when-youre-singing
npm install
npm run build
npm start
```

### Nginx Config (via Forge):

```nginx
location / {
    try_files $uri $uri/ @node;
}

location @node {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### Process Management:

Use PM2 to keep the app running:

```bash
npm install -g pm2
pm2 start npm --name "quiz-app" -- start
pm2 startup
pm2 save
```

---

## Local Testing

Test production build locally:

```bash
npm run build
npm start
```

Then visit http://localhost:3000

---

## Domain Setup

### For Render.com:

- Free subdomain: `your-app-name.onrender.com`
- Custom domain available on paid plans

### For Digital Ocean:

- Point your domain to the droplet IP
- Set up SSL via Forge (automatic with Let's Encrypt)

---

## Costs Comparison

| Service               | Cost                 | Pros                         | Cons                    |
| --------------------- | -------------------- | ---------------------------- | ----------------------- |
| Render.com (Free)     | $0                   | Easy setup, auto-deploys     | Sleeps after 15min idle |
| Render.com (Paid)     | $7/month             | No sleep, better performance | More expensive than DO  |
| Digital Ocean + Forge | $6/month + $10/month | Full control, no sleep       | More setup required     |

**Recommendation**: Start with Render.com free tier, upgrade when you need 24/7 uptime.
