import dbClient from '../utils/db.js'; // Ensure correct paths
import redisClient from '../utils/redis.js';

class AppController {
  static getStatus (request, response) {
    if (dbClient.isAlive() && redisClient.isAlive()) {
      response.status(200).json({ redis: true, db: true });
    } else {
      response.status(500).json({ redis: false, db: false });
    }
  }

  static async getStats (request, response) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    response.status(200).json({ users, files });
  }
}

export default AppController;
