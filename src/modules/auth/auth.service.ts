import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Account } from '@prisma/generated/client'
import type { SendOtpRequest, VerifyOtpRequest } from '@vendee-cinema/contracts/gen/auth'

import { OtpService } from '../otp'

import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
	public constructor(
		private readonly authRepository: AuthRepository,
		private readonly otpService: OtpService
	) {}

	public async sendOtp(data: SendOtpRequest) {
		const { identifier, type } = data

		let account: Account | null

		if (type === 'phone') account = await this.authRepository.findByPhone(identifier)
		else account = await this.authRepository.findByEmail(identifier)

		if (!account)
			account = await this.authRepository.create({
				email: type === 'email' ? identifier : undefined,
				phone: type === 'phone' ? identifier : undefined
			})

		const code = await this.otpService.send(identifier, type as 'phone' | 'email')
		console.debug('CODE: ', code)

		return { ok: true }
	}

	public async verifyOtp(data: VerifyOtpRequest) {
		const { code, identifier, type } = data

		await this.otpService.verify(identifier, code, type as 'phone' | 'email')

		let account: Account | null

		if (type === 'phone') account = await this.authRepository.findByPhone(identifier)
		else account = await this.authRepository.findByEmail(identifier)

		if (!account) throw new RpcException('Account not found')

		if (type === 'phone' && !account.isPhoneVerified)
			await this.authRepository.update(account.id, { isPhoneVerified: true })

		if (type === 'email' && !account.isEmailVerified)
			await this.authRepository.update(account.id, { isEmailVerified: true })

		// mock for now
		return { accessToken: '123456', refreshToken: '123456' }
	}
}
