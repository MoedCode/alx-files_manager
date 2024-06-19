import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    const userExists = await dbClient.usersCollection.findOne({ email });

    if (userExists) {
      return res.status(400).send({ error: 'Already exist' });
    }


    const user = await dbClient.usersCollection.insertOne({ email, password: sha1(password) });

    return res.status(201).send({ id: user.insertedId, email });
  }
}
export default UsersController;
if (require.main === module){
    const usersControllers = new UsersController();
    console.log(usersControllers);

}