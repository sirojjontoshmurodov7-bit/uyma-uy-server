import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller.js';
import { PropertiesService } from './properties.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService],
  imports: [PrismaModule, AuthModule],
})
export class PropertiesModule {}
