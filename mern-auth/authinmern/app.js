const express = require("express");
const dotenv = require("dotenv")
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const connectdb = require("./config/db.js");
dotenv.config();
const router=require("./routers/main-router.js");
const userrouter=require("./routers/user-router.js");

const allowedOrigins = [
  "https://authentication-system-yoa2.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
connectdb();

const PORT = process.env.PORT || 4000 ;
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', router);
app.use('/api/user',userrouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});

