import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from 'src/common/decorators/roles.decorator';
import { NotFoundErrorResponseDto } from 'src/common/dto/not-found-error.dto';
import { RequestSuccessDto } from 'src/common/dto/request-success.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { UserDto } from './dto/user.dto';
import { UserEmailParamDto } from './dto/user-email-param.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { UserUpdateInputDto } from './dto/user-update-input.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserDto],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'The number of users to return (default: 1000)',
    example: 100,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get()
  async getAll(@Query('limit') limit?: number): Promise<UserDto[]> {
    const users = await this.usersService.getAll(limit);
    return users;
  }

  @ApiOperation({ summary: 'Get a user by email' })
  @ApiParam({
    name: 'email',
    description: 'Email of the user',
    type: String,
    example: 'example@gmail.com',
  })
  @ApiResponse({
    status: 200,
    description: 'User',
    type: UserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: NotFoundErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get(':email')
  async getOne(@Param() params: UserEmailParamDto): Promise<Omit<User, 'password' | 'totpSecret'>> {
    const user = await this.usersService.findOne(params.email, ['password', 'totpSecret']);

    if (!user) {
      throw new NotFoundException(`User with email "${params.email}" not found.`);
    }

    return user;
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the user to be deleted',
    type: String,
    example: '60d9d3f0f7b63a23d8c432a8',
  })
  @ApiBody({ type: UserUpdateInputDto })
  @ApiResponse({
    status: 200,
    description: 'Updated user',
    type: UserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: NotFoundErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch(':id')
  async update(
    @Param() params: UserIdParamDto,
    @Body() updateUserDto: UserUpdateInputDto,
  ): Promise<Omit<User, 'password' | 'totpSecret'>> {
    const updatedUser = await this.usersService.update(params.id, updateUserDto, [
      'password',
      'totpSecret',
    ]);

    if (!updatedUser) {
      throw new NotFoundException(`User with id "${params.id}" not found.`);
    }

    return updatedUser;
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the user to be deleted',
    type: String,
    example: '60d9d3f0f7b63a23d8c432a8',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: NotFoundErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete(':id')
  async delete(@Param() params: UserIdParamDto): Promise<RequestSuccessDto> {
    const userToDelete = await this.usersService.findOneById(params.id, []);

    if (!userToDelete) {
      throw new NotFoundException(`User with id "${params.id}" not found.`);
    }

    await this.usersService.delete(userToDelete._id);
    return {
      message: `The user with id: ${userToDelete.id} was successfully deleted`,
    };
  }
}
