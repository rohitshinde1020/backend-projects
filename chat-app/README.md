# Chat App

Real-time chat application with React (Vite) frontend and Node.js/Express/Socket.IO backend.

## Project structure

```
chat-app/
├── Backend/     # Express API + Socket.IO server
└── Frontend/    # React SPA (Vite)
```

## Local development

### 1. Backend

```bash
cd Backend
cp .env.example .env
# Fill in MongoDB, JWT, and Cloudinary credentials
npm install
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd Frontend
cp .env.example .env
# Set VITE_BACKEND_URL=http://localhost:5000
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Environment variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | No | Database name (default: `chat-app`) |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars in production) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `PORT` | No | Server port (default: `5000`) |
| `FRONTEND_URL` | Yes in prod | Comma-separated allowed frontend origins |
| `NODE_ENV` | No | Set to `production` when deploying |

### Frontend (`Frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | Yes | Backend API URL (set at **build time**) |

## Production deployment

Deploy the frontend and backend separately.

### Backend (Railway, Render, Fly.io, etc.)

1. Set all backend environment variables on your host.
2. Set `NODE_ENV=production`.
3. Set `FRONTEND_URL` to your live frontend URL (e.g. `https://your-app.vercel.app`).
4. Start command: `npm start` (runs `node index.js`).

Health check endpoint: `GET /api/status`

### Frontend (Vercel, Netlify, etc.)

1. Set `VITE_BACKEND_URL` to your live backend URL (e.g. `https://api.yourapp.com`).
2. Build command: `npm run build`
3. Output directory: `dist`

SPA routing is configured via:
- `Frontend/vercel.json` (Vercel)
- `Frontend/public/_redirects` (Netlify)

### Important notes

- **CORS**: Backend only allows origins listed in `FRONTEND_URL`.
- **WebSockets**: Socket.IO connections require a valid JWT token.
- **Single instance**: Online presence uses in-memory storage. For multiple backend instances, add a Redis adapter for Socket.IO.
- **Secrets**: Never commit `.env` files. Use `.env.example` as a template.

## Scripts

| App | Command | Purpose |
|-----|---------|---------|
| Backend | `npm run dev` | Development with nodemon |
| Backend | `npm start` | Production server |
| Frontend | `npm run dev` | Vite dev server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run preview` | Preview production build |
