import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InquiriesService } from './inquiries.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { CreateInquiryDTO } from './dto/create-inquiry.dto.js';

@UseGuards(JwtAuthGuard)
@Controller()
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get('/inquiries/my')
  getMyInquiries(@Req() req: any) {
    return this.inquiriesService.getMyInquiries(req.user.id);
  }

  @Post('/properties/:propertyId/inquiries')
  createInquiries(
    @Param('propertyId') propertyId: number,
    @Req() req: any,
    @Body() body: CreateInquiryDTO,
  ) {
    return this.inquiriesService.createInquiry(propertyId, req.user.id, body);
  }
}
