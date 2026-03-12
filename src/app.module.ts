import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import {
	databaseEnv,
	grpcEnv,
	passportEnv,
	redisEnv,
	telegramEnv
} from './config/env'
import { AllConfigs } from './config/interfaces'
import { PrismaModule } from './infrastructure/prisma'
import { RedisModule } from './infrastructure/redis'
import { AccountModule } from './modules/account'
import { AuthModule } from './modules/auth'
import { OtpModule } from './modules/otp'
import { TelegramModule } from './modules/telegram'
import { TokenModule } from './modules/token/token.module';

@Module({
	imports: [
		ConfigModule.forRoot<AllConfigs>({
			isGlobal: true,
			load: [databaseEnv, grpcEnv, passportEnv, redisEnv, telegramEnv]
		}),
		PrismaModule,
		RedisModule,
		AuthModule,
		OtpModule,
		AccountModule,
		TelegramModule,
		TokenModule
	]
})
export class AppModule {}
