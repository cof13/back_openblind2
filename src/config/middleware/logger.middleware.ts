import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'];

    // Registro de la solicitud entrante
    this.logger.log(
      `Incoming request - Method: ${method}, URL: ${originalUrl}, IP: ${ip}, User-Agent: ${userAgent}`,
      'HTTP',
    );

    // Registro del tiempo de respuesta
    const start = Date.now();
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      this.logger.log(
        `Request completed - Status: ${statusCode}, Duration: ${duration}ms`,
        'HTTP',
      );
    });

    next();
  }
}

