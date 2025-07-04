// src/config/database.mongo.ts

import { MongooseModuleOptions } from '@nestjs/mongoose';
import { keys } from './keys';

export const mongooseConfig: MongooseModuleOptions = {
  uri: keys.MONGO_URI as string, 
}
