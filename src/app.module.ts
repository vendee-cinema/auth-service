import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { databaseEnv, grpcEnv, redisEnv } from './config/env'
import { PrismaModule } from './infrastructure/prisma'
import { RedisModule } from './infrastructure/redis'
import { AuthModule } from './modules/auth'
import { OtpModule } from './modules/otp'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [databaseEnv, grpcEnv, redisEnv]
		}),
		PrismaModule,
		RedisModule,
		AuthModule,
		OtpModule
	]
})
export class AppModule {}
