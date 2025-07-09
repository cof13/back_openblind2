import { Injectable } from '@nestjs/common';
import { CreateTransportDto } from '../modules/transport/dto/create-transport.dto';
import { UpdateTransportDto } from '../modules/transport/dto/update-transport.dto';

@Injectable()
export class TransportService {
  create(createTransportDto: CreateTransportDto) {
    return 'This action adds a new transport';
  }

  findAll() {
    return `This action returns all transport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transport`;
  }

  update(id: number, updateTransportDto: UpdateTransportDto) {
    return `This action updates a #${id} transport`;
  }

  remove(id: number) {
    return `This action removes a #${id} transport`;
  }
}
