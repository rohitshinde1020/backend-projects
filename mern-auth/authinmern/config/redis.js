const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
    if (redisClient) return redisClient;
    redisClient = createClient({
        url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err.message);
    });

    await redisClient.connect();
    console.log('Redis connected');
    return redisClient;
};

const getRedis = () => {
    if (!redisClient) {
        throw new Error('Redis not connected. Call connectRedis first.');
    }
    return redisClient;
};

module.exports = { connectRedis, getRedis };

