#!/usr/bin/env node
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  /**
   * constructing a new class instance
   */
  constructor () {
    this.newCient = createClient();
    this.newCient.on('error', (error) => {
      console.log(error.message);
    });
  }

  /**
   *  Check connection status of redis client
   * @returns {boolean} - the connection status
   */
  isAlive () {
    return this.newCient.connected;
  }

  /**
   * look for a value for a given key
   * @param {string} key - to look for
   * @returns {*} - value for concern key
   */
  async get (key) {
    const asyncGet = promisify(this.newCient.get).bind(this.newCient);
    const value = await asyncGet(key);
    return value;
  }

  /**
   *  set the given value for the given key
   * @param {string} key
   * @param {*} value
   * @param {int} duration
   */
  async set (key, value, duration) {
    const asyncSet = promisify(this.newCient.set).bind(this.newCient);
    await asyncSet(key, value, 'EX', duration);
  }

  /**
   * deletes an entry for a given key
   * @param {string} key
   */
  async del (key) {
    const asyncDel = promisify(this.newCient).bind(this.newCient);
    await asyncDel(key);
  }

  /**
   *  closes redis client connection
   */
  async close () {
    this.newCient.quit();
  }
}

const redisClient = new RedisClient();
export default redisClient;
