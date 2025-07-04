import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'app.log');

const createLogDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

createLogDirectory(logDir);

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'debug', // Puedes ajustar a 'info' o 'warn' si prefieres menos verbosidad
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, context, stack }) => {
          const contextStr = context ? `[${context}]` : '';
          const stackStr = stack ? ` - ${stack}` : '';
          return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}${stackStr}`;
        }),
      ),
      transports: [
        // Archivo en modo "vivo"
        new winston.transports.File({
          filename: logFile,
          level: 'debug',
          options: { flags: 'a' }, // Importante para escritura continua
        }),

        // Consola para desarrollo
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              const contextStr = context ? `[${context}]` : '';
              return `${timestamp} ${level} ${contextStr} ${message}`;
            })
          ),
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, stack: trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  setLogLevels?(levels: LogLevel[]) {
    // Opcional
  }
}
