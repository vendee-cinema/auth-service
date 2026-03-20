import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import type {
	TelegramCompleteRequest,
	TelegramCompleteResponse,
	TelegramConsumeRequest,
	TelegramConsumeResponse,
	TelegramInitResponse,
	TelegramVerifyRequest,
	TelegramVerifyResponse
} from '@vendee-cinema/contracts/gen/ts/auth'

import { TelegramService } from './telegram.service'

@Controller()
export class TelegramController {
	public constructor(private readonly telegramService: TelegramService) {}

	@GrpcMethod('AuthService', 'TelegramInit')
	public async getAuthUrl(): Promise<TelegramInitResponse> {
		return this.telegramService.getAuthUrl()
	}

	@GrpcMethod('AuthService', 'TelegramVerify')
	public async verify(
		data: TelegramVerifyRequest
	): Promise<TelegramVerifyResponse> {
		return this.telegramService.verify(data)
	}

	@GrpcMethod('AuthService', 'TelegramComplete')
	public async complete(
		data: TelegramCompleteRequest
	): Promise<TelegramCompleteResponse> {
		return await this.telegramService.complete(data)
	}

	@GrpcMethod('AuthService', 'TelegramConsume')
	public async consumeSession(
		data: TelegramConsumeRequest
	): Promise<TelegramConsumeResponse> {
		return await this.telegramService.consumeSession(data)
	}
}
