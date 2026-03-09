import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaModule } from './infrastructure/prisma'
import { RedisModule } from './infrastructure/redis'
import { AuthModule } from './modules/auth'
import { OtpModule } from './modules/otp'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		RedisModule,
		AuthModule,
		OtpModule
	]
})
export class AppModule {}
