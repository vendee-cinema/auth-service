import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import { RpcStatus } from '@vendee-cinema/common'
import type {
	TelegramCompleteRequest,
	TelegramConsumeRequest,
	TelegramVerifyRequest
} from '@vendee-cinema/contracts/gen/ts/auth'
import { createHash, createHmac, randomBytes } from 'crypto'

import { AllConfigs } from '@/config/interfaces'
import { RedisService } from '@/infrastructure/redis'
import { UserRepository } from '@/shared/repositories'

import { TokenService } from '../token'
import { UserClientGrpc } from '../user'

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
		private readonly userRepository: UserRepository,
		private readonly tokenService: TokenService,
		private readonly userClient: UserClientGrpc
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
			.digest()

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

		this.userClient.create({ id: exists.id }).subscribe()

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

	public async complete(data: TelegramCompleteRequest) {
		const { sessionId, phone } = data
		const raw = await this.redis.get(`telegram_session:${sessionId}`)
		if (!raw)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Session not found'
			})

		const { telegramId } = JSON.parse(raw)
		let user = await this.userRepository.findByPhone(phone)
		if (!user) user = await this.userRepository.create({ phone })
		await this.userRepository.update(user.id, {
			telegramId,
			isPhoneVerified: true
		})

		const tokens = this.tokenService.generate(user.id)
		await this.redis.set(
			`telegram_tokens:${sessionId}`,
			JSON.stringify(tokens),
			'EX',
			120
		)

		await this.redis.del(`telegram_session:${sessionId}`)
		return { sessionId }
	}

	public async consumeSession(data: TelegramConsumeRequest) {
		const { sessionId } = data
		const raw = await this.redis.get(`telegram_tokens:${sessionId}`)
		if (!raw)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Session not found'
			})

		const tokens = JSON.parse(raw)
		await this.redis.del(`telegram_tokens:${sessionId}`)
		return tokens
	}
}
