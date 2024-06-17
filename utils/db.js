import { MongoClient } from 'mongodb';

console.log(MongoClient);
class DBClient {
  /**
   * constructing DBClint new instance
   */
  constructor () {
    const HOST = process.env.DB_HOST || 'localhost';
    const PORT = process.env.DB_PORT || 27017;
    const DATABASE = process.env.DB_DATABASE || 'files_manager';
    const URL = `mongodb://${HOST}:${PORT}`;
    this.MongoClient = new MongoClient(URL, { useUnifiedTopology: true });
    this.MongoClient.connect((error) => {
      if (!error) this.db = this.MongoClient.db(DATABASE);
    });
  }

  /**
  * check connection status of mongoDB
  * @returns {boolean} connection status
  */
  isActive () {
    return this.MongoClient.isConnected();
  }

  /**
 * get concern collection from database
 * @param {*} collectionName
 * @returns {import("mongodb").Collection} users collection
 */
  getCollection (collectionName) {
    const collection = this.collection(collectionName);
    return collection;
  }

  /**
 * get  number of users
 * @returns {number} users number
 */
  async nbUsers () {
    const usersCollection = this.getCollection('users');
    const usersNumber = await usersCollection.countDocuments();
    return usersNumber;
  }

  /**
 * close the connection to mongodb
 */
  async close () {
    await this.mongoClient.close();
  }
}
const dbClient = new DBClient();
export default dbClient;
