import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Account } from '@prisma/generated/client'
import { RpcStatus } from '@vendee-cinema/common'
import type {
	RefreshRequest,
	SendOtpRequest,
	VerifyOtpRequest
} from '@vendee-cinema/contracts/gen/auth'

import { UserRepository } from '@/shared/repositories'

import { OtpService } from '../otp'
import { TokenService } from '../token'

import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
	public constructor(
		private readonly authRepository: AuthRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService,
		private readonly tokenService: TokenService
	) {}

	public async sendOtp(data: SendOtpRequest) {
		const { identifier, type } = data

		let account: Account | null

		if (type === 'phone')
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account)
			account = await this.authRepository.create({
				email: type === 'email' ? identifier : undefined,
				phone: type === 'phone' ? identifier : undefined
			})

		const code = await this.otpService.send(
			identifier,
			type as 'phone' | 'email'
		)
		console.debug('CODE: ', code)

		return { ok: true }
	}

	public async verifyOtp(data: VerifyOtpRequest) {
		const { code, identifier, type } = data

		await this.otpService.verify(identifier, code, type as 'phone' | 'email')

		let account: Account | null

		if (type === 'phone')
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account)
			throw new RpcException({ code: 5, details: 'Account not found' })

		if (type === 'phone' && !account.isPhoneVerified)
			await this.userRepository.update(account.id, { isPhoneVerified: true })

		if (type === 'email' && !account.isEmailVerified)
			await this.userRepository.update(account.id, { isEmailVerified: true })

		return this.tokenService.generate(account.id)
	}

	public async refresh(data: RefreshRequest) {
		const { refreshToken } = data
		console.log(refreshToken)

		const { valid, reason, userId } = this.tokenService.verify(refreshToken)
		if (!valid)
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: reason
			})
		return this.tokenService.generate(userId)
	}
}
