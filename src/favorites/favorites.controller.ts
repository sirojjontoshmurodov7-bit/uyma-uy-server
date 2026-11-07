import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { retry } from 'rxjs';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@Req() req: any) {
    return this.favoritesService.getFavorites(req.user.id);
  }

  @Post(':propertyId')
  addFavorite(@Param('propertyId') propertyId: number, @Req() req: any) {
    return this.favoritesService.addFavorite(req.user.id, propertyId);
  }

  @Delete(':propertyId')
  removeFavorite(@Param('propertyId') propertyId: number, @Req() req: any) {
    return this.favoritesService.removeFavorite(req.user.id, propertyId);
  }
}
