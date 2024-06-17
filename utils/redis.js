import { createClient } from 'redis';
import { promisify } from 'util';

// Redis client class
class RedisClient {
  /**
   * constructing a new class instance
   */
  constructor () {
    this.redisClient = createClient();
    this.redisClient.on('error', (error) => {
      console.log(error.message);
    });
  }

  /**
   * Check connection status of redis client
   * @returns {boolean} - the connection status
   */
  isAlive () {
    return this.redisClient.connected;
  }

  /**
   * look for a value for a given key
   * @param {string} key - to look for
   * @returns {*} - value for concern key
   */
  async get (key) {
    const asyncGet = promisify(this.redisClient.get).bind(this.redisClient);
    const value = await asyncGet(key);
    return value;
  }

  /**
   * set the given value for the given key
   * @param {string} key
   * @param {*} value
   * @param {int} duration
   */

  async set (key, value, duration) {
    const asyncSet = promisify(this.redisClient.set).bind(this.redisClient);
    await asyncSet(key, value, 'EX', duration);
  }

  /**
   * deletes an entry for a given key
   * @param {string} ke
   */
  async del (key) {
    const asyncDel = promisify(this.redisClient.del).bind(this.redisClient);
    await asyncDel(key);
  }

  /**
   * Closes redis client connection
   */
  async close () {
    this.redisClient.quit();
  }
}

const redisClient = new RedisClient();
export default redisClient;
