import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'

import {
	databaseEnv,
	grpcEnv,
	passportEnv,
	redisEnv,
	rmqEnv,
	telegramEnv
} from './config/env'
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
import { ObservabilityModule } from './observability'

@Module({
	imports: [
		ConfigModule.forRoot<AllConfigs>({
			isGlobal: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				'.env'
			],
			load: [databaseEnv, grpcEnv, passportEnv, redisEnv, rmqEnv, telegramEnv]
		}),
		// TODO: setup config
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env.LOG_LEVEL,
				transport: {
					target: 'pino/file',
					options: {
						destination: '/var/log/services/auth/auth.log',
						mkdir: true
					}
				},
				messageKey: 'msg',
				customProps: () => ({ service: 'auth-service' })
			}
		}),
		PrismaModule,
		RedisModule,
		MessagingModule,
		ObservabilityModule,
		AuthModule,
		OtpModule,
		AccountModule,
		TelegramModule,
		TokenModule,
		UserModule
	]
})
export class AppModule {}
