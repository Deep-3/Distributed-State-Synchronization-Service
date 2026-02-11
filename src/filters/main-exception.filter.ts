import { Catch, ArgumentsHost, HttpException, HttpStatus, ExceptionFilter } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

import { captureException } from "@sentry/node";

import { ERROR_MESSAGES } from "src/constants/messages.constants";
import { logger } from "src/services/logger.service";

@Catch(HttpException)
export class MainExceptionFilter implements ExceptionFilter {
  constructor(private httpAdapterHost: HttpAdapterHost) {}
  catch(exception: Error, host: ArgumentsHost): void {
    const { message, stack, response } = exception as AnyType;
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      [HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND].includes(statusCode)
    ) {
      return httpAdapter.reply(ctx.getResponse(), response, statusCode);
    }

    logger.error(`EXCEPTION FILTER:: Exception: ${message}, stack: ${stack}`);
    captureException(exception, {
      extra: {
        statusCode,
        message,
        stack,
      },
    });

    const responseBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    };

    return httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
