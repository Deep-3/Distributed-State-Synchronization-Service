/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import cookieParser from "cookie-parser";
import { urlencoded as expressUrlencoded } from "express";

import { allowedOrigins, globalPrefix, swaggerInfo } from "src/constants/app.constants";
import { MainExceptionFilter } from "src/filters/main-exception.filter";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new MainExceptionFilter(httpAdapter));

  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  app.enableCors({ credentials: true, origin: allowedOrigins });

  app.use(cookieParser());
  app.use(expressUrlencoded({ limit: "10mb", extended: true })); // URL-encoded requests limited to 5 MB

  const config = new DocumentBuilder()
    .setTitle(swaggerInfo.title)
    .setDescription(swaggerInfo.description)
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
