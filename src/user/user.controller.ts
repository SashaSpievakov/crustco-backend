import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from 'src/common/decorators/roles.decorator';
import { NotFoundErrorResponseDto } from 'src/common/dto/not-found-error.dto';
import { ValidationErrorResponseDto } from 'src/common/dto/validation-error.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { UserDto } from './dto/user.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { User } from './schemas/user.schema';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    const users = await this.userService.getAll(limit);
    return users;
  }

  @ApiOperation({ summary: 'Get a user by email' })
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
  async getOne(@Param('email') email: string): Promise<Omit<User, 'password' | 'totpSecret'>> {
    const user = await this.userService.findOne(email, ['password', 'totpSecret']);

    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found.`);
    }

    return user;
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiBody({ type: UserUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Updated user',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: ValidationErrorResponseDto,
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
    @Param('id') id: string,
    @Body() updateUserDto: UserUpdateDto,
  ): Promise<Omit<User, 'password' | 'totpSecret'>> {
    const updatedUser = await this.userService.update(id, updateUserDto, [
      'password',
      'totpSecret',
    ]);

    if (!updatedUser) {
      throw new NotFoundException(`User with id "${id}" not found.`);
    }

    return updatedUser;
  }
}
