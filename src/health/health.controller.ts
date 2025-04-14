import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
  ) {}

  @ApiOperation({ summary: "App's Health Check" })
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck('mongo')]);
  }
}
