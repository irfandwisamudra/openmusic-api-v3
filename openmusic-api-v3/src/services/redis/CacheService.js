const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: { host: process.env.REDIS_SERVER },
    });

    this._client.on('error', (err) => console.error(err));
    this._client.connect();
  }

  async set(key, value, ttlSeconds = 1800) {
    await this._client.set(key, value, { EX: ttlSeconds });
  }

  async get(key) {
    return this._client.get(key);
  }

  delete(key) {
    return this._client.del(key);
  }

  async setJSON(key, obj, ttlSeconds = 1800) {
    await this.set(key, JSON.stringify(obj), ttlSeconds);
  }
  async getJSON(key) {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

module.exports = CacheService;
