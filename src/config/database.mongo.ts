//src/config/database.mongo.ts`**:
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { keys } from './keys';
export const mongooseConfig: MongooseModuleOptions = {
  uri: keys.MONGO_URI as string,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,

};
