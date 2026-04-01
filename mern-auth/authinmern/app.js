const express = require("express");
const dotenv = require("dotenv")
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectdb = require("./config/db.js");
dotenv.config();
const router=require("./routers/main-router.js");
const userrouter=require("./routers/user-router.js");
const { connectRedis } = require("./config/redis.js");

// Validate environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI', 'SENDER', 'SMTP_USER', 'SMTP_PASSWORD','REDIS_URL', 'FRONTEND_URL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

const allowedOrigins = [
  process.env.FRONTEND_URL,
];

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 4000 ;
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', router);
app.use('/api/user',userrouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Backend is running' });
});

const startServer = async () => {
  try {
    await connectdb();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

