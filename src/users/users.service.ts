import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const passwordHash = await this.hashedPassword(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      password: passwordHash,
    });
    return await this.userRepository.save(user);
  }

  async hashedPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: {
        username: username,
      },
      relations: {
        wishes: true,
        wishLists: true,
      },
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let newPassword;
    if (updateUserDto.password) {
      newPassword = await this.hashedPassword(updateUserDto.password);
      return this.userRepository.update(id, {
        ...updateUserDto,
        password: newPassword,
      });
    }
    return this.userRepository.update(id, updateUserDto);
  }

  async findUsers(user): Promise<User[]> {
    return await this.userRepository.find({
      where: [{ username: user.query }, { email: user.query }],
    });
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete({ id });
  }

  async findByYandexID(email) {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  }

  async createFromYandex(profile: any) {
    return this.userRepository.save(profile);
  }
}
