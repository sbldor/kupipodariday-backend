import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Profile } from 'passport-yandex';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException('неправильное имя или пароль');
    }

    return bcrypt.compare(password, user.password).then((matched) => {
      if (!matched) {
        return null;
      }

      return user;
    });
  }

  async validateFromYandex(yandexProfile: Profile) {
    const user = await this.usersService.findByYandexID(yandexProfile.email);

    if (!user) {
      return await this.usersService.createFromYandex(yandexProfile);
    }

    return user;
  }
}
