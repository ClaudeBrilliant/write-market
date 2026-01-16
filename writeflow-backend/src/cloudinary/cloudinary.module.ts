import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  providers: [CloudinaryService],
  controllers: [CloudinaryController],
  exports: [CloudinaryService]
})
export class CloudinaryModule {}
