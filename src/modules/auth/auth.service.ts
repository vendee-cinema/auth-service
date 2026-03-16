import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Account, ContactType } from '@prisma/generated/client'
import { convertEnum, RpcStatus } from '@vendee-cinema/common'
import {
	type RefreshRequest,
	type SendOtpRequest,
	type VerifyOtpRequest
} from '@vendee-cinema/contracts/gen/auth'

import { MessagingService } from '@/infrastructure/messaging'
import { UserRepository } from '@/shared/repositories'

import { OtpService } from '../otp'
import { TokenService } from '../token'
import { UserClientGrpc } from '../user'

@Injectable()
export class AuthService {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService,
		private readonly tokenService: TokenService,
		private readonly messagingService: MessagingService,
		private readonly userClient: UserClientGrpc
	) {}

	public async sendOtp(data: SendOtpRequest) {
		const { identifier, type } = data

		let account: Account | null

		if (convertEnum(ContactType, type) === ContactType.PHONE)
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account)
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

		const { code } = await this.otpService.send(
			identifier,
			convertEnum(ContactType, type)
		)

		await this.messagingService.otpRequested({
			identifier,
			type: convertEnum(ContactType, type),
			code
		})

		return { ok: true }
	}

	public async verifyOtp(data: VerifyOtpRequest) {
		const { code, identifier, type } = data

		await this.otpService.verify(
			identifier,
			code,
			convertEnum(ContactType, type)
		)

		let account: Account | null

		if (convertEnum(ContactType, type) === ContactType.PHONE)
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account)
			throw new RpcException({ code: 5, details: 'Account not found' })

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

		this.userClient.create({ id: account.id }).subscribe()

		return this.tokenService.generate(account.id)
	}

	public async refresh(data: RefreshRequest) {
		const { refreshToken } = data

		const { valid, reason, userId } = this.tokenService.verify(refreshToken)
		if (!valid)
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: reason
			})

		return this.tokenService.generate(userId)
	}
}
