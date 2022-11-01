import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { WishesService } from '../wishes/wishes.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from '../wishes/entities/wish.entity';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { UsersService } from '../users/users.service';
import { isOwner } from '../utils/utils';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async create(user: User, createOfferDto: CreateOfferDto) {
    const wishes = await this.wishesService.findOne(createOfferDto.itemId);
    const { id } = user;
    if (createOfferDto.amount < 0) {
      throw new BadRequestException('вложение не может быть отрицательным');
    }
    if (isOwner(id, wishes.owner.id)) {
      throw new BadRequestException('вы автор');
    }
    const balance = wishes.price - wishes.raised;
    if (createOfferDto.amount > balance) {
      throw new BadRequestException('слишком большая сумма');
    }
    await this.wishesService.update(createOfferDto.itemId, {
      raised: wishes.raised + createOfferDto.amount,
    });
    const wish = await this.wishesService.findOne(wishes.id);

    return this.offerRepository.save({
      ...createOfferDto,
      user,
      item: wish,
    });
  }

  async findAll() {
    return await this.offerRepository.find({
      relations: {
        item: {
          name: true,
        },
        user: {
          username: true,
          offers: true,
        },
      },
    });
  }

  findOne(id: number): Promise<Offer> {
    return this.offerRepository.findOne({
      relations: {
        item: true,
        user: true,
      },
      where: { id },
    });
  }
}
