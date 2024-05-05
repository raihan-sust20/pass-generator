import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GeneratePasswordDto } from './dto/generate-password.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
