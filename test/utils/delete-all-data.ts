import { Connection } from 'mongoose';

export const deleteAllData = async (databaseConnection: Connection) => {
  await databaseConnection.collection('users').deleteMany({});
  await databaseConnection.collection('blog').deleteMany({});
  await databaseConnection.collection('post').deleteMany({});
  await databaseConnection.collection('comment').deleteMany({});
  await databaseConnection.collection('device').deleteMany({});
};