import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
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

  @Post()
  createLocation(@Req() req, @Body() body: CreateLocationDto) {
    return this.locationService.createLocation(req.user, body);
  }
}
