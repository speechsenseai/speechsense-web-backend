import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateLocationDto } from './dto/CreateLocation.dto';

@ApiTags('locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}
  @Get()
  getLocations(@Req() req, @Paginate() query: PaginateQuery) {
    return this.locationService.getLocations(req.user.sub, query);
  }

  @Get(':locationId')
  getOneLocation(@Req() req, @Param('locationId') locationId: string) {
    return this.locationService.getOneLocation(req.user.user, locationId);
  }

  @Put(':locationId')
  updateLocation(
    @Req() req,
    @Param('locationId') locationId: string,
    @Body() body: CreateLocationDto,
  ) {
    return this.locationService.updateLocation(req.user.user, locationId, body);
  }

  @Delete(':locationId')
  deleteLocation(@Req() req, @Param('locationId') locationId: string) {
    return this.locationService.deleteLocationWithS3(req.user.user, locationId);
  }

  @Post()
  createLocation(@Req() req, @Body() body: CreateLocationDto) {
    return this.locationService.createLocation(req.user.user, body);
  }
}
