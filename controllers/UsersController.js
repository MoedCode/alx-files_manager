import Queue from 'bull';
import UsersCollection from '../utils/users.js';

// User welcome email queue
const userQueue = Queue('send welcome email');

class UsersController {
  /**
   * Controller for endpoint POST /users for creating new users
   * @typedef {import("express").Request} Request
   * @typedef {import("express").Response} Response
   * @param {Request} request - request object
   * @param {Response} response - response object
   */
  static async postNew (request, response) {
    const { email, password } = request.body;
    if (email === undefined) {
      response.status(400).json({ error: 'Missing email' });
    } else if (password === undefined) {
      response.status(400).json({ error: 'Missing password' });
    } else if (await UsersCollection.getUser({ email })) {
      response.status(400).json({ error: 'Already exist' });
    } else {
      // Create new user
      const userId = await UsersCollection.createUser(email, password);
      userQueue.add({ userId });
      response.status(201).json({ id: userId, email });
    }
  }

  static async getMe (req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const userId = await redisClient.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userId) });

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    return res.status(200).send({ id: user._id, email: user.email });
  }
}

export default UsersController;
