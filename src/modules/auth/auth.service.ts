import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Account, ContactType } from '@prisma/generated/client'
import { convertEnum, RpcStatus } from '@vendee-cinema/common'
import {
	type RefreshRequest,
	type SendOtpRequest,
	type VerifyOtpRequest
} from '@vendee-cinema/contracts/auth'
import { PinoLogger } from 'nestjs-pino'

import { MessagingService } from '@/infrastructure/messaging'
import { UserRepository } from '@/shared/repositories'

import { OtpService } from '../otp'
import { TokenService } from '../token'
import { UserClientGrpc } from '../user'

@Injectable()
export class AuthService {
	public constructor(
		private readonly logger: PinoLogger,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService,
		private readonly tokenService: TokenService,
		private readonly messagingService: MessagingService,
		private readonly userClient: UserClientGrpc
	) {
		this.logger.setContext(AuthService.name)
	}

	public async sendOtp(data: SendOtpRequest) {
		const { identifier, type } = data

		this.logger.info(
			`OTP request received: indentifier=${identifier}, type=${type}`
		)

		let account: Account | null

		if (convertEnum(ContactType, type) === ContactType.PHONE)
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account) {
			this.logger.info(
				`Account not found, creating new account for ${identifier}`
			)

			account = await this.userRepository.create({
				email:
					convertEnum(ContactType, type) === ContactType.EMAIL
						? identifier
						: undefined,
				phone:
					convertEnum(ContactType, type) === ContactType.PHONE
						? identifier
						: undefined
			})
		}
		const { code } = await this.otpService.send(
			identifier,
			convertEnum(ContactType, type)
		)

		await this.messagingService.otpRequested({
			identifier,
			type: convertEnum(ContactType, type),
			code
		})

		this.logger.info(`OTP sent successfully to ${identifier}`)

		return { ok: true }
	}

	public async verifyOtp(data: VerifyOtpRequest) {
		const { code, identifier, type } = data

		this.logger.info(`OTP verification attempt: ${identifier}, code=${code}`)

		await this.otpService.verify(
			identifier,
			code,
			convertEnum(ContactType, type)
		)

		let account: Account | null

		if (convertEnum(ContactType, type) === ContactType.PHONE)
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account) {
			this.logger.warn(`OTP verified but account not found: ${identifier}`)
			throw new RpcException({ code: 5, details: 'Account not found' })
		}

		if (
			convertEnum(ContactType, type) === ContactType.PHONE &&
			!account.isPhoneVerified
		)
			await this.userRepository.update(account.id, { isPhoneVerified: true })

		if (
			convertEnum(ContactType, type) === ContactType.EMAIL &&
			!account.isEmailVerified
		)
			await this.userRepository.update(account.id, { isEmailVerified: true })

		this.logger.info(`OTP verified successfully for ${identifier}`)

		this.userClient.create({ id: account.id }).subscribe()

		return this.tokenService.generate(account.id)
	}

	public async refresh(data: RefreshRequest) {
		const { refreshToken } = data

		this.logger.debug('Refresh token requested')

		const { valid, reason, userId } = this.tokenService.verify(refreshToken)
		if (!valid) {
			this.logger.warn(`Invalid refresh token: reason=${reason}`)
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: reason
			})
		}

		this.logger.info(`Refresh token verified successfully for user=${userId}`)

		return this.tokenService.generate(userId)
	}
}
