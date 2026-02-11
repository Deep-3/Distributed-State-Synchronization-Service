import { HttpException, HttpStatus } from "@nestjs/common";

import { plainToInstance, type ClassConstructor } from "class-transformer";
import { StatusCodes } from "http-status-codes";

import type { Response } from "express";

export interface CommonResponseType<T> {
  data: T;
  status?: number;
  transformWith?: ClassConstructor<T>;
}

interface ErrorResponseType {
  res: Response;
  error: Error | HttpException;
  additionalErrors?: Array<{ row: number; errorMessages: string[] }>;
  statusCode?: StatusCodes;
}

interface ErrorResponseFormat {
  statusCode: number;
  message: string;
  errors?: Array<{ row: number; errorMessages: string[] }>;
}

class ResponseUtils {
  public success<T>(
    resp: Response,
    { data, status = StatusCodes.OK, transformWith }: CommonResponseType<T>,
  ): Response<CommonResponseType<T>> {
    let responseData = data;

    if (transformWith) {
      responseData = plainToInstance(transformWith, data, {
        excludeExtraneousValues: true,
      });
    }

    return resp.status(status).send({ data: responseData, status });
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public error({ res, error, statusCode, additionalErrors }: ErrorResponseType) {
    const errorStatus = error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST;

    const errorResponse: ErrorResponseFormat = {
      statusCode: statusCode ?? errorStatus,
      message: error.message,
    };

    if (additionalErrors && additionalErrors.length > 0) {
      errorResponse.errors = additionalErrors;
    }

    return res.status(errorStatus).send(errorResponse);
  }
}

export default new ResponseUtils();
