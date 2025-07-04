import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('active')
  findActiveUsers() {
    return this.userService.findActiveUsers();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get(':id/profile')
  getUserProfile(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserProfile(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/profile')
  updateUserProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() profileData: any
  ) {
    return this.userService.updateUserProfile(id, profileData);
  }

  @Patch(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.userService.changePassword(id, changePasswordDto);
  }

  @Patch(':id/update-last-access')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateLastAccess(@Param('id', ParseIntPipe) id: number) {
    return this.userService.updateLastAccess(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
