import dbClient from './db.js';
import sha1 from 'sha1';

class Password {
  /**
   * Encrypts a password using sha1
   * @param {string} password - password to encrypt
   * @returns - encrypted password
   */
  static encryptPassword(password) {
    return sha1(password);
  }

  /**
   * Checks if a password is valid
   * @param {string} password - password to check
   * @param {string} hashedPassword - hashed password to compare against
   * @returns {boolean} - true if password is valid, false otherwise
   */
  static isPasswordValid(password, hashedPassword) {
    return sha1(password) === hashedPassword;
  }
}


// Utility class for users database operations
class UsersCollection {
  /**
   * Creates new user document in database
   * @param {string} email - user email
   * @param {string} password - user password
   * @returns {string | null} - user id
   */
  static async createUser(email, password) {
    const collection = dbClient.getCollection('users');
    const newUser = { email, password: Password.encryptPassword(password) };
    const commandResult = await collection.insertOne(newUser);
    return commandResult.insertedId;
  }

  /**
   * Retrieves user document from database
   * @param {object} query - query parameters
   * @returns { import('mongodb').Document} - user document
   */
  static async getUser(query) {
    const collection = dbClient.getCollection('users');
    const user = await collection.findOne(query);
    return user;
  }
}

export default UsersCollection;
