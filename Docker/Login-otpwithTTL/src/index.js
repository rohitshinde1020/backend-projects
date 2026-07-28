const express = require('express');
const redis = require('ioredis');

const app = express();
app.use(express.json());
function getkey(phone) {
    return `otp:${phone}`;
}

const redisclient = new redis(process.env.REDIS_HOST || "redis://localhost:6379 ");

app.post('/otp', async(req, res) => {
    const { phone } = req.body;
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the OTP in Redis with a TTL of 5 minutes (300 seconds)
    await redisclient.set(getkey(phone), otp, "EX", 300);
    res.send({ phone, otp });
});

app.post('/verify', async(req, res) => {
    const { phone, otp } = req.body;
    const storedOtp = await redisclient.get(getkey(phone));
    if (storedOtp === otp) {
        await redisclient.del(getkey(phone));
        res.send({ valid: true });
    } else {
        res.status(400).send({ valid: false });
    }
});

// Endpoint to check the TTL of the OTP for a given phone number it is still validv
app.get('/otp/:phone/ttl', async(req, res) => {
    const { phone } = req.params;
    const ttl = await redisclient.ttl(getkey(phone));
    res.send({ phone, ttl });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});