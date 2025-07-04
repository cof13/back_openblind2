import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

export const ApiStandardResponse = <TModel extends Type<any>>(
  status: number,
  model?: TModel,
  options?: Omit<ApiResponseOptions, 'status' | 'type'>
) => {
  return applyDecorators(
    ApiResponse({
      status,
      type: model,
      ...options,
    })
  );
};