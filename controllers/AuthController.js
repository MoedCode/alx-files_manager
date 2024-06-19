import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid';

class AuthController {
  static async getConnect (req, res) {
    const auth = req.header('Authorization');
    if (!auth) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const buff = Buffer.from(auth.slice(6), 'base64');
    const creds = buff.toString('utf-8');
    const [email, password] = creds.split(':');

    const user = await dbClient.usersCollection.findOne({ email, password });

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const token = await redisClient.createToken(user._id);

    return res.status(200).send({ token });
  }

  static async getDisconnect (req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const userId = await redisClient.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    await redisClient.delToken(token);

    return res.status(204).send();
  }
}

export default AuthController;
