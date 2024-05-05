import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const appService = app.select(AppModule).get(AppService, { strict: true });
  await appService.generatePassword()
  await app.close()

  // const app = await NestFactory.create(AppModule);
  // const config = new DocumentBuilder()
  //   .setTitle('Password Generator')
  //   .setDescription('Password generator API')
  //   .setVersion('1.0')
  //   .addTag('password')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  // app.useGlobalPipes(new ValidationPipe());
  // await app.listen(3000);
}
bootstrap();
