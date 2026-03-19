import { Module } from '@nestjs/common'

import { MetricsModule } from './metrics'

@Module({
	imports: [MetricsModule]
})
export class ObservabilityModule {}
