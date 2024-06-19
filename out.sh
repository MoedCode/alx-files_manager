==================== ./controllers/AppController.js ====================
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

==================== ./controllers/AuthController.js ====================
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

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

==================== ./controllers/FilesController.js ====================
#!/usr/bin/env node

==================== ./controllers/UsersController.js ====================
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
console.log(new UsersCollection());
export default UsersController;

==================== ./main.js ====================
import dbClient from './utils/db.js';

/**
 * Waits for the MongoDB client to be connected
 * @returns {Promise<void>} Resolves when the client is connected
 */
const waitConnection = () => {
  return new Promise((resolve, reject) => {
    let i = 0;
    const repeatFct = async () => {
      await setTimeout(() => {
        i += 1;
        if (i >= 10) {
          reject();
        } else if (!dbClient.isAlive()) {
          repeatFct();
        } else {
          resolve();
        }
      }, 1000);
    };
    repeatFct();
  });
};

(async () => {
  console.log(dbClient.isAlive());
  await waitConnection();
  console.log(dbClient.isAlive());
  console.log(await dbClient.nbUsers());
  console.log(await dbClient.nbFiles());
})();

==================== ./routes/index.js ====================
import { Router } from 'express';
import statusRoutes from './status.js';
import usersRoutes from './usersRoutes.js';

const router = Router();

router.use(statusRoutes);
router.use(usersRoutes);

export default router;

==================== ./routes/status.js ====================
import { Router } from 'express';
import AppController from '../controllers/AppController.js';

const statusRouter = Router();

statusRouter.get('/status', AppController.getStatus);
statusRouter.get('/stats', AppController.getStats);

export default statusRouter;

==================== ./routes/usersRoutes.js ====================
import { Router } from 'express';
import UsersController from '../controllers/UsersController.js';
import AuthController from '../controllers/AuthController.js';

const usersRoutes = Router();

usersRoutes.post('/users', UsersController.postNew);
usersRoutes.get('/users/me', UsersController.getMe);

usersRoutes.get('/connect', AuthController.getConnect);
usersRoutes.get('/disconnect', AuthController.getDisconnect);

export default usersRoutes;

==================== ./server.js ====================
import express from 'express';
import routes from './routes/index.js';
import bodyParser from 'body-parser'; // Corrected: Imported body-parser
// Express app
const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

==================== ./temp.js ====================
#!/usr/bin/env node
import pkg from 'mongodb';
const { MongoClient } = pkg; // Destructure MongoClient from the default import

const url = 'mongodb://localhost:27017';
const dbName = 'example_db';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function main() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to server');

    // Connect to the database
    const db = client.db(dbName);

    // Connect to the collection
    const collection = db.collection('users');

    // Insert a user document
    const user = { email: 'john.doe@example.com', password: 'hashed_password_here' };
    const insertResult = await collection.insertOne(user);
    console.log('Inserted user:', insertResult.insertedId);

    // Retrieve the user document
    const retrievedUser = await collection.findOne({ email: 'john.doe@example.com' });
    console.log('Retrieved user:', retrievedUser);

  } finally {
    // Close the connection
    await client.close();
  }
}

main().catch(console.error);

==================== ./utils/db.js ====================
// utils/db.js
// utils/db.js
import mongodb from 'mongodb';
const { MongoClient } = mongodb;

/**
 * DBClient class that handles the connection to MongoDB
 */
class DBClient {
  /**
   * Constructor for DBClient
   * Initializes the MongoDB client and connects to the database
   */
  constructor () {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
      });
  }

  /**
   * Checks if the MongoDB client is connected
   * @returns {boolean} True if the client is connected, otherwise false
   */
  isAlive () {
    return this.client && this.client.isConnected();
  }

  /**
   * Gets the number of documents in the "users" collection
   * @returns {Promise<number>} The number of documents in the "users" collection
   */
  async nbUsers () {
    if (!this.db) {
      return 0;
    }
    return this.db.collection('users').countDocuments();
  }

  /**
 * get concern collection from database
 * @param {*} collectionName
 * @returns {import("mongodb").Collection} users collection
 */
  getCollection (collectionName) {
    return this.db.collection(collectionName);
  }

  /**
   * Gets the number of documents in the "files" collection
   * @returns {Promise<number>} The number of documents in the "files" collection
   */
  async nbFiles () {
    // if (!this.db) {
    //   return 0;
    // }
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();

export default dbClient;
if (process.argv[2]) console.log(dbClient);

==================== ./utils/redis.js ====================
import { createClient } from 'redis';
import { promisify } from 'util';

// Redis client class
console.log(createClient);
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

==================== ./utils/users.js ====================
import dbClient from './db.js';
import sha1 from 'sha1';

// Utility class for users database operations
class UsersCollection {
  /**
   * Encrypts a password using sha1
   * @param {string} password - password to encrypt
   * @returns {string} - encrypted password
   */
  static encryptPassword (password) {
    return sha1(password);
  }

  /**
   * Checks if a password is valid
   * @param {string} password - password to check
   * @param {string} hashedPassword - hashed password to compare against
   * @returns {boolean} - true if password is valid, false otherwise
   */
  static isPasswordValid (password, hashedPassword) {
    return sha1(password) === hashedPassword;
  }

  /**
   * Creates new user document in database
   * @param {string} email - user email
   * @param {string} password - user password
   * @returns {string | null} - user id
   */
  static async createUser (email, password) {
    const collection = dbClient.getCollection('users');
    const newUser = { email, password: UsersCollection.encryptPassword(password) };
    const commandResult = await collection.insertOne(newUser);
    return commandResult.insertedId;
  }

  /**
   * Retrieves user document from database
   * @param {object} query - query parameters
   * @returns { import('mongodb').Document} - user document
   */
  static async getUser (query) {
    const collection = dbClient.getCollection('users');
    const user = await collection.findOne(query);
    return user;
  }
}

export default UsersCollection;

==================== ./utils/_redis.js ====================
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

==================== ./worker.js ====================
#!/usr/bin/env node

