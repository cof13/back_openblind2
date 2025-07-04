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
    TypeOrmModule.forFeature([User, Role]),
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: UserProfileSchema }
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Exportar para usar en otros módulos (ej: auth)
})
export class UserModule {}