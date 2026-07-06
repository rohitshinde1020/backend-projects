const express = require('express');
const Redis = require('ioredis');

const app = express();
app.use(express.json());

// When this app runs inside Docker Compose, Redis is usually reachable by its service name.
// When it runs on your local machine, localhost:6379 also works.
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = new Redis(redisUrl);

// We will cache one sample user profile using two different Redis styles:
// 1. JSON string cache: store the whole profile as one JSON string value.
// 2. Hash cache: store each profile field separately inside a Redis hash.
//
// JSON is simpler to understand because the full object is saved with SET/GET.
// Hash is useful when you want to read or update only one field, because Redis
// can fetch specific fields without sending the whole object back and forth.
const SAMPLE_USER_ID = '1';
const JSON_PROFILE_KEY = `user:profile:${SAMPLE_USER_ID}:json`;
const HASH_PROFILE_KEY = `user:profile:${SAMPLE_USER_ID}:hash`;

function buildProfileFromBody(body = {}) {
    const name = body.name || 'John Doe';
    const email = body.email || 'john@example.com';
    const age = Number(body.age || 25);

    return { id: SAMPLE_USER_ID, name, email, age };
}

function isProfileValid(profile) {
    return Boolean(profile.name && profile.email && Number.isFinite(Number(profile.age)));
}

function extractProfileUpdates(body = {}) {
    const updates = {};

    if (body.name !== undefined) {
        updates.name = body.name;
    }

    if (body.email !== undefined) {
        updates.email = body.email;
    }

    if (body.age !== undefined) {
        updates.age = Number(body.age);
    }

    return updates;
}

// Save the profile as one JSON string in Redis.
// Redis stores it as a single value, so the whole object must be read and written together.
app.post('/profile/json', async (req, res) => {
    try {
        const profile = buildProfileFromBody(req.body);

        if (!isProfileValid(profile)) {
            return res.status(400).json({
                message: 'name, email, and age are required for the profile',
            });
        }

        await redisClient.set(JSON_PROFILE_KEY, JSON.stringify(profile));

        return res.status(201).json({
            message: 'Profile cached as JSON string in Redis',
            storage: 'json',
            key: JSON_PROFILE_KEY,
            profile,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to save profile as JSON',
            error: error.message,
        });
    }
});

// Read the JSON string from Redis and convert it back into a normal JavaScript object.
app.get('/profile/json', async (req, res) => {
    try {
        const cachedProfile = await redisClient.get(JSON_PROFILE_KEY);

        if (!cachedProfile) {
            return res.status(404).json({
                message: 'No JSON profile cache found yet',
                key: JSON_PROFILE_KEY,
            });
        }

        return res.json({
            storage: 'json',
            key: JSON_PROFILE_KEY,
            profile: JSON.parse(cachedProfile),
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to read profile as JSON',
            error: error.message,
        });
    }
});

// Update the JSON profile.
// Redis stores JSON as one string, so we must:
// 1. GET the current value.
// 2. Parse it into an object.
// 3. Merge the new fields.
// 4. SET the whole object back again.
// This is why JSON is easy to understand, but not the best choice when you only
// want to update one small field often.
app.put('/profile/json', async (req, res) => {
    try {
        const cachedProfile = await redisClient.get(JSON_PROFILE_KEY);

        if (!cachedProfile) {
            return res.status(404).json({
                message: 'No JSON profile cache found yet to update',
                key: JSON_PROFILE_KEY,
            });
        }

        const currentProfile = JSON.parse(cachedProfile);
        const updates = extractProfileUpdates(req.body);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'Send at least one field to update: name, email, or age',
            });
        }

        const updatedProfile = {
            ...currentProfile,
            ...updates,
        };

        if (!isProfileValid(updatedProfile)) {
            return res.status(400).json({
                message: 'Updated profile must still have a valid name, email, and age',
            });
        }

        await redisClient.set(JSON_PROFILE_KEY, JSON.stringify(updatedProfile));

        return res.json({
            message: 'Profile updated in Redis JSON cache',
            storage: 'json',
            key: JSON_PROFILE_KEY,
            profile: updatedProfile,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update profile as JSON',
            error: error.message,
        });
    }
});

// Save the same profile as a Redis Hash.
// A hash is like a small table inside Redis: field -> value pairs.
// Example: name = John Doe, email = john@example.com, age = 25.
app.post('/profile/hash', async (req, res) => {
    try {
        const profile = buildProfileFromBody(req.body);

        if (!isProfileValid(profile)) {
            return res.status(400).json({
                message: 'name, email, and age are required for the profile',
            });
        }

        await redisClient.hset(HASH_PROFILE_KEY, {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            age: String(profile.age),
        });

        return res.status(201).json({
            message: 'Profile cached as Redis Hash',
            storage: 'hash',
            key: HASH_PROFILE_KEY,
            profile,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to save profile as hash',
            error: error.message,
        });
    }
});

// Read every field from the Redis Hash.
// Redis returns everything as strings, so we convert age back into a number.
app.get('/profile/hash', async (req, res) => {
    try {
        const cachedProfile = await redisClient.hgetall(HASH_PROFILE_KEY);

        if (!cachedProfile || Object.keys(cachedProfile).length === 0) {
            return res.status(404).json({
                message: 'No hash profile cache found yet',
                key: HASH_PROFILE_KEY,
            });
        }

        return res.json({
            storage: 'hash',
            key: HASH_PROFILE_KEY,
            profile: {
                id: cachedProfile.id,
                name: cachedProfile.name,
                email: cachedProfile.email,
                age: Number(cachedProfile.age),
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to read profile as hash',
            error: error.message,
        });
    }
});

// Update the Redis Hash profile.
// Hashes are easier to update because Redis lets us change only the fields we
// want with HSET. We still read the current hash first so we can return the full
// updated profile to the user.
app.put('/profile/hash', async (req, res) => {
    try {
        const cachedProfile = await redisClient.hgetall(HASH_PROFILE_KEY);

        if (!cachedProfile || Object.keys(cachedProfile).length === 0) {
            return res.status(404).json({
                message: 'No hash profile cache found yet to update',
                key: HASH_PROFILE_KEY,
            });
        }

        const updates = extractProfileUpdates(req.body);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'Send at least one field to update: name, email, or age',
            });
        }

        const updatedProfile = {
            id: cachedProfile.id,
            name: updates.name !== undefined ? updates.name : cachedProfile.name,
            email: updates.email !== undefined ? updates.email : cachedProfile.email,
            age:
                updates.age !== undefined
                    ? updates.age
                    : Number(cachedProfile.age),
        };

        if (!isProfileValid(updatedProfile)) {
            return res.status(400).json({
                message: 'Updated profile must still have a valid name, email, and age',
            });
        }

        await redisClient.hset(HASH_PROFILE_KEY, {
            name: updatedProfile.name,
            email: updatedProfile.email,
            age: String(updatedProfile.age),
        });

        return res.json({
            message: 'Profile updated in Redis Hash cache',
            storage: 'hash',
            key: HASH_PROFILE_KEY,
            profile: updatedProfile,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update profile as hash',
            error: error.message,
        });
    }
});

// A small helper route so a beginner can quickly see both cache styles at once.
app.get('/profile/demo', async (req, res) => {
    try {
        const [jsonProfile, hashProfile] = await Promise.all([
            redisClient.get(JSON_PROFILE_KEY),
            redisClient.hgetall(HASH_PROFILE_KEY),
        ]);

        return res.json({
            json: jsonProfile ? JSON.parse(jsonProfile) : null,
            hash:
                hashProfile && Object.keys(hashProfile).length > 0
                    ? {
                            id: hashProfile.id,
                            name: hashProfile.name,
                            email: hashProfile.email,
                            age: Number(hashProfile.age),
                        }
                    : null,
            note: 'Use POST /profile/json or POST /profile/hash to store a profile first.',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to load the demo profile',
            error: error.message,
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        message: 'Redis user profile cache demo',
        endpoints: {
            'POST /profile/json': 'Store a user profile as a JSON string',
            'GET /profile/json': 'Read the JSON string profile from Redis',
            'PUT /profile/json': 'Update the JSON profile by reading and saving the whole object again',
            'POST /profile/hash': 'Store a user profile as a Redis Hash',
            'GET /profile/hash': 'Read the Hash profile from Redis',
            'PUT /profile/hash': 'Update one or more fields in the Redis Hash profile',
            'GET /profile/demo': 'See both cache formats at the same time',
        },
    });
});

async function startServer() {
    try {
        await redisClient.ping();
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
            console.log(`Connected to Redis at ${redisUrl}`);
        });
    } catch (error) {
        console.error('Could not connect to Redis:', error.message);
        process.exit(1);
    }
}

startServer();