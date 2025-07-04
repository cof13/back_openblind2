// src/modules/user/user.module.ts (Versión corregida)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../models/mysql/user.entity';
import { Role } from '../../models/mysql/role.entity';
import { UserProfile, UserProfileSchema } from '../../models/mongodb/user-profile.schema';

@Module({
  imports: [
    // TypeORM para entidades MySQL
    TypeOrmModule.forFeature([User, Role]),
    
    // Mongoose para esquemas MongoDB - SIN especificar conexión
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: UserProfileSchema }
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}