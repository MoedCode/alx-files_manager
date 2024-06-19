import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload (req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const userId = await redisClient.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ error: 'Missing name' });
    }

    const { type } = req.body;
    if (!type) {
      return res.status(400).send({ error: 'Missing type' });
    }

    const { parentId } = req.body;
    if (parentId) {
      const parentFile = await dbClient.filesCollection.findOne({ _id: parentId, userId });
      if (!parentFile) {
        return res.status(400).send({ error: 'Parent not found' });
      }
    }

    const data = {
      userId,
      name,
      type,
      parentId
    };

    const file = await dbClient.filesCollection.insertOne(data);

    return res.status(201).send({
      id: file.insertedId,
      userId,
      name,
      type,
      parentId
    });
  }

  static async getShow (req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const userId = await redisClient.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const file = await dbClient.filesCollection.findOne({ _id: id, userId });
    if (!file) {
      return res.status(404).send({ error: 'Not found' });
    }

    return res.status(200).send({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      parentId: file.parentId
    });
  }

  static async getIndex (req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const userId = await redisClient.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const files = await dbClient.filesCollection.find({ userId }).toArray();

    return res.status(200).send(files);
  }
}

export default FilesController;
