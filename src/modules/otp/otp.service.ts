import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { ContactType } from '@prisma/generated/enums'
import { RpcStatus } from '@vendee-cinema/common'
import { PinoLogger } from 'nestjs-pino'
import { createHash } from 'node:crypto'
import { generateCode } from 'patcode'

import { RedisService } from '@/infrastructure/redis'

@Injectable()
export class OtpService {
	public constructor(
		private readonly logger: PinoLogger,
		private readonly redis: RedisService
	) {
		this.logger.setContext(OtpService.name)
	}

	private generateCode() {
		const code = generateCode()
		const hash = createHash('sha256').update(code).digest('hex')
		this.logger.debug(`Generated OTP hash=${hash}`)
		return { code, hash }
	}

	public async send(identifier: string, type: ContactType) {
		const { code, hash } = this.generateCode()
		this.logger.debug(`OTP generated for ${identifier}: ${code}. hash=${hash}`)
		await this.redis.set(`otp:${type}:${identifier}`, hash, 'EX', 300)
		this.logger.info(`OTP stored in Redis for ${identifier}`)
		return { code, hash }
	}

	public async verify(identifier: string, code: string, type: ContactType) {
		const storedHash = await this.redis.get(`otp:${type}:${identifier}`)
		if (!storedHash) {
			this.logger.warn(`OTP expired or missing for ${identifier}`)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Invalid or expired code'
			})
		}

		const incomingHash = createHash('sha256').update(code).digest('hex')
		if (storedHash !== incomingHash) {
			this.logger.warn(`OTP verification failed for ${identifier}: wrong code`)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Invalid or expired code'
			})
		}

		await this.redis.del(`otp:${type}:${identifier}`)
	}
}
