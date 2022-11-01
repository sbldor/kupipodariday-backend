import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from '../guards/jwt.guard';
import { Wish } from './entities/wish.entity';
import { isOwner } from '../utils/utils';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req, @Body() createWishDto: CreateWishDto): Promise<Wish> {
    return this.wishesService.create(req.user, createWishDto);
  }

  @Get('top')
  findTop() {
    return this.wishesService.findTopWishes();
  }

  @Get('last')
  findLast() {
    return this.wishesService.findLastWishes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishesService.findOne(+id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const wish = await this.wishesService.findOne(+id);
    if (isOwner(req.user.id, wish.owner.id)) {
      return await this.wishesService.update(+id, updateWishDto);
    }
    throw new ForbiddenException();
  }
  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const wish = await this.wishesService.findOne(+id);
    if (isOwner(req.user.id, wish.owner.id)) {
      return this.wishesService.remove(+id);
    }
    throw new ForbiddenException();
  }
  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copy(@Req() req, @Param('id') id: string) {
    const wish = await this.wishesService.findOne(+id);
    if (isOwner(req.user.id, wish.owner.id)) {
      throw new ConflictException();
    }
    const copyWish = {
      name: wish.name,
      image: wish.image,
      link: wish.link,
      price: wish.price,
      description: wish.description,
    };
    await this.wishesService.create(req.user, copyWish);
    await this.wishesService.update(wish.id, { copied: +1 });
  }
}
