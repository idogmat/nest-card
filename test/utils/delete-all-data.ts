import { Connection } from 'mongoose';

export const deleteAllData = async (databaseConnection: Connection) => {
  await databaseConnection.collection('users').deleteMany({});
  await databaseConnection.collection('some').deleteMany({});
};