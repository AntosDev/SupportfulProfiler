import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string | undefined, Date | undefined> {
  transform(value: string | undefined, metadata: ArgumentMetadata): Date | undefined {
    if (!value) return undefined;

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return date;
  }
} 