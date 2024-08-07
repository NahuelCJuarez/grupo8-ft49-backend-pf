import { Injectable } from '@nestjs/common';
import { ShipmentDto } from './shipments.dto';
import { ShipmentsRepository } from './shipments.repository';

@Injectable()
export class ShipmentsService {
  constructor(private readonly shipmentsRepository: ShipmentsRepository) {}
  getShipments(page: number, limit: number) {
    return this.shipmentsRepository.getShipments(page, limit);
  }
  postShipments(data: ShipmentDto) {
    return this.shipmentsRepository.postShipments(data);
  }
  putShipments(id: string, data: ShipmentDto) {
    return this.shipmentsRepository.putShipments(id, data);
  }
  deleteShipments(id: string) {
    return this.shipmentsRepository.deleteShipments(id);
  }
  preloadShipmentPrices() {
    return this.shipmentsRepository.preloadShipmentPrices();
  }
}
