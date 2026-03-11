import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { databaseEnv, grpcEnv, passportEnv, redisEnv } from './config/env'
import { AllConfigs } from './config/interfaces'
import { PrismaModule } from './infrastructure/prisma'
import { RedisModule } from './infrastructure/redis'
import { AuthModule } from './modules/auth'
import { OtpModule } from './modules/otp'

@Module({
	imports: [
		ConfigModule.forRoot<AllConfigs>({
			isGlobal: true,
			load: [databaseEnv, grpcEnv, passportEnv, redisEnv]
		}),
		PrismaModule,
		RedisModule,
		AuthModule,
		OtpModule
	]
})
export class AppModule {}
