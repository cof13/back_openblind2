import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseOptionalIntPipe implements PipeTransform {
  transform(value: any): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new BadRequestException('El valor debe ser un número entero');
    }
    
    return parsed;
  }
}