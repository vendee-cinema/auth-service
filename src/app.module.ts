import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import {
	databaseEnv,
	grpcEnv,
	passportEnv,
	redisEnv,
	telegramEnv
} from './config/env'
import { rmqEnv } from './config/env/rmq.env'
import { AllConfigs } from './config/interfaces'
import { MessagingModule } from './infrastructure/messaging'
import { PrismaModule } from './infrastructure/prisma'
import { RedisModule } from './infrastructure/redis'
import { AccountModule } from './modules/account'
import { AuthModule } from './modules/auth'
import { OtpModule } from './modules/otp'
import { TelegramModule } from './modules/telegram'
import { TokenModule } from './modules/token'
import { UserModule } from './modules/user'

@Module({
	imports: [
		ConfigModule.forRoot<AllConfigs>({
			isGlobal: true,
			load: [databaseEnv, grpcEnv, passportEnv, redisEnv, rmqEnv, telegramEnv]
		}),
		PrismaModule,
		RedisModule,
		MessagingModule,
		AuthModule,
		OtpModule,
		AccountModule,
		TelegramModule,
		TokenModule,
		UserModule
	]
})
export class AppModule {}
