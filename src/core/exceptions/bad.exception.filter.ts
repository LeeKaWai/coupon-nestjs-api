import { HttpException } from '@nestjs/common';
import { HttpStatus as NestHttpStatus } from '@nestjs/common';

export const HttpStatus = {
  ...NestHttpStatus,
  INVALIDATE: 65532,
};

export class BadRequestException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class NotAcceptableException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.NOT_ACCEPTABLE);
  }
}

export class RequestTimeoutException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.REQUEST_TIMEOUT);
  }
}

export class ConflictException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class GoneException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.GONE);
  }
}

export class PayloadTooLargeException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.PAYLOAD_TOO_LARGE);
  }
}
export class UnsupportedMediaTypeException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
export class NotImplementedException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.NOT_IMPLEMENTED);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message: Record<string, unknown>) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
