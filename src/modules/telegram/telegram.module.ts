import { Module } from '@nestjs/common'

import { UserRepository } from '@/shared/repositories'

import { TokenService } from '../token'
import { UserModule } from '../user'

import { TelegramController } from './telegram.controller'
import { TelegramRepository } from './telegram.repository'
import { TelegramService } from './telegram.service'

@Module({
	imports: [UserModule],
	controllers: [TelegramController],
	providers: [TelegramService, TelegramRepository, UserRepository, TokenService]
})
export class TelegramModule {}
