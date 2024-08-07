import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Package } from './packages.entity';
import { Repository } from 'typeorm';
import { PackageDto } from './packages.dto';
import { PackageSize } from './packages.enum';
import { PackagePrices } from './prices.entity';
import * as data from '../utils/packagesprices.json';
import { PackagePricesDto } from './prices.dto';

@Injectable()
export class PackagesRepository {
  constructor(
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
    @InjectRepository(PackagePrices)
    private packagePricesRepository: Repository<PackagePrices>,
  ) {}

  async preloadPrices() {
    const alreadyLoaded = await this.packagePricesRepository.find();
    if (alreadyLoaded.length) return null;
    data?.map(async (element) => {
      await this.packagePricesRepository
        .createQueryBuilder()
        .insert()
        .into(PackagePrices)
        .values({
          ENVELOP: element.ENVELOP,
          SMALL: element.SMALL,
          MEDIUM: element.MEDIUM,
          LARGE: element.LARGE,
        })
        .orIgnore()
        .execute();
    });
    console.log('Package prices added successfully');
    return 'Package prices added successfully';
  }

  async updatePrice(updatepackage: Partial<PackagePricesDto>) {
    let packagePrices = await this.packagePricesRepository.findOne({
      where: {},
    });
    if (!packagePrices) {
      packagePrices = new PackagePrices();
    }

    packagePrices.ENVELOP = updatepackage.ENVELOP;
    packagePrices.SMALL = updatepackage.SMALL;
    packagePrices.MEDIUM = updatepackage.MEDIUM;
    packagePrices.LARGE = updatepackage.LARGE;

    return await this.packagePricesRepository.save(packagePrices);
  }

  async getPackages(page: number, limit: number): Promise<Package[]> {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be greater than 0.');
    }

    const skip = (page - 1) * limit;
    const packages = await this.packagesRepository.find({
      take: limit,
      skip: skip,
    });

    return packages;
  }

  async getPackage(id: string): Promise<Package> {
    const packagedb = await this.packagesRepository.findOneBy({ id });
    if (!packagedb) {
      throw new NotFoundException(`Package with id ${id} not found`);
    }

    return packagedb;
  }

  //funcion ficticia para calcular el precio, debe ser actualizada con la logica real cuando sepamos bien como calcula el cliente el precio de cada paquete
  async calculatePrice(
    size: PackageSize,
    packagePrices: PackagePrices,
  ): Promise<number> {
    switch (size) {
      case PackageSize.ENVELOP:
        return packagePrices.ENVELOP;
      case PackageSize.SMALL:
        return packagePrices.SMALL;
      case PackageSize.MEDIUM:
        return packagePrices.MEDIUM;
      case PackageSize.LARGE:
        return packagePrices.LARGE;
      default:
        throw new BadRequestException(
          'package size is not small, medium or large',
        );
    }
  }

  async pricePackage(packagePrice: Partial<Package>) {
    const size: PackageSize = packagePrice.size;

    let packagePrices: PackagePrices =
      await this.packagePricesRepository.findOne({ where: {} });
    if (!packagePrices) {
      packagePrices = new PackagePrices();
    }

    const calculatedPrice = await this.calculatePrice(size, packagePrices);
    packagePrice.package_price = calculatedPrice;
    return packagePrice;
  }

  async addPackage(addpackage: Partial<Package>) {
    const size: PackageSize = addpackage.size;

    let packagePrices: PackagePrices =
      await this.packagePricesRepository.findOne({ where: {} });
    if (!packagePrices) {
      packagePrices = new PackagePrices();
    }

    const calculatedPrice = await this.calculatePrice(size, packagePrices);
    addpackage.package_price = calculatedPrice;

    const newPackage = await this.packagesRepository.save(addpackage);
    return newPackage;
  }

  async updatePackage(id: string, updatepackage: Partial<PackageDto>) {
    const existingPackage = await this.packagesRepository.findOneBy({ id });
    if (!existingPackage) {
      throw new NotFoundException(`Package with id ${id} not found`);
    }
    await this.packagesRepository.update(id, updatepackage);
    const updatedPackage = await this.packagesRepository.findOneBy({ id });
    return updatedPackage;
  }

  async deletePackage(id: string): Promise<string> {
    const packagedb = await this.packagesRepository.findOneBy({ id });
    if (!packagedb) {
      throw new NotFoundException(`Package with id ${id} not found`);
    }
    this.packagesRepository.remove(packagedb);
    return 'Package deleted';
  }
}
