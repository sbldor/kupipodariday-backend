import { Controller, Post, UseGuards, Req, Body, Get } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalGuard } from '../guards/local.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('/')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('signin')
  signin(@Req() req) {
    return this.authService.auth(req.user);
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return this.authService.auth(user);
    } catch (err) {
      throw err.detail;
    }
  }

  @UseGuards(AuthGuard('yandex'))
  @Get('yandex')
  yandex() {
    /* Этот метод можно оставить пустым, так как Passport перенаправит пользователя в Яндекс */
  }

  @UseGuards(AuthGuard('yandex'))
  @Get('yandex/callback')
  yandexCallback(@Req() req) {
    return this.authService.auth(req.user);
  }
}
