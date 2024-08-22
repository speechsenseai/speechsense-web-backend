import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

@ApiTags('Recorgings')
@Controller('recording')
export class RecordingController {}
