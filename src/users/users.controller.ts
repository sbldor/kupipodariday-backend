import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtGuard } from '../guards/jwt.guard';
import { WishesService } from '../wishes/wishes.service';
import { Wish } from '../wishes/entities/wish.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateResult } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @Post()
  async create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  findUser(@Req() req: any) {
    const { username } = req.user;
    return this.usersService.findByUsername(username);
  }

  @UseGuards(JwtGuard)
  @Get(':username')
  async findUserByUserName(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    return user;
  }

  @UseGuards(JwtGuard)
  @Get('me/wishes')
  findWishesMyUser(@Req() req): Promise<Wish[]> {
    const { id } = req.user;
    return this.wishesService.findWishesByUserId(id);
  }

  @UseGuards(JwtGuard)
  @Get(':username/wishes')
  async findWishesByUserName(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    const wish = await this.wishesService.findWishesByUserId(user.id);
    return wish;
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post('find')
  public async findMany(@Body() user): Promise<User[]> {
    return this.usersService.findUsers(user);
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  async update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    const { id } = req.user;
    return this.usersService.update(id, updateUserDto);
  }
  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('такого пользователя нет');
    }
    return this.usersService.remove(+id);
  }
}
