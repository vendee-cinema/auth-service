import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import { RpcStatus } from '@vendee-cinema/common'
import type { TelegramVerifyRequest } from '@vendee-cinema/contracts/gen/auth'
import { createHash, createHmac, randomBytes } from 'crypto'

import { AllConfigs } from '@/config/interfaces'
import { RedisService } from '@/infrastructure/redis'

import { TokenService } from '../token'

import { TelegramRepository } from './telegram.repository'

@Injectable()
export class TelegramService {
	private readonly BOT_ID: string
	private readonly BOT_TOKEN: string
	private readonly BOT_USERNAME: string
	private readonly REDIRECT_ORIGIN: string

	public constructor(
		private readonly redis: RedisService,
		private readonly configService: ConfigService<AllConfigs>,
		private readonly telegramRepository: TelegramRepository,
		private readonly tokenService: TokenService
	) {
		this.BOT_ID = configService.get('telegram.botId', { infer: true })
		this.BOT_TOKEN = configService.get('telegram.botToken', { infer: true })
		this.BOT_USERNAME = configService.get('telegram.botUsername', {
			infer: true
		})
		this.REDIRECT_ORIGIN = configService.get('telegram.redirectOrigin', {
			infer: true
		})
	}

	private checkAuth(query: Record<string, string>) {
		const { hash } = query
		if (!hash) return false

		const dataCheckArr = Object.keys(query)
			.filter(key => key !== 'hash')
			.sort()
			.map(key => `${key}=${query[key]}`)

		const dataCheckString = dataCheckArr.join('\n')

		const secretKey = createHash('sha256')
			.update(`${this.BOT_ID}:${this.BOT_TOKEN}`)
			.digest('hex')

		const hmac = createHmac('sha256', secretKey)
			.update(dataCheckString)
			.digest('hex')

		const isValid = hmac === hash
		return isValid
	}

	public getAuthUrl() {
		const url = new URL('https://oauth.telegram.org/auth')
		url.searchParams.append('bot_id', this.BOT_ID)
		url.searchParams.append('origin', this.REDIRECT_ORIGIN)
		url.searchParams.append('request_access', 'write')
		url.searchParams.append('return_to', `${this.REDIRECT_ORIGIN}`)
		return { url: url.href }
	}

	public async verify(data: TelegramVerifyRequest) {
		const isValid = this.checkAuth(data.query)
		if (!isValid)
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: 'Invalid Telegram signature'
			})

		const { id: telegramId, username } = data.query
		const exists = await this.telegramRepository.findByTelegramId(telegramId)
		if (exists && exists.phone) return this.tokenService.generate(exists.id)

		const sessionId = randomBytes(16).toString('hex')
		// TODO: add checks for username, first_name, last_name etc.
		await this.redis.set(
			`telegram_session:${sessionId}`,
			JSON.stringify({ telegramId, username }),
			'EX',
			300
		)
		return { url: `https://t.me/${this.BOT_USERNAME}?start=${sessionId}` }
	}
}
