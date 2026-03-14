import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { ContactType } from '@prisma/generated/enums'
import { RpcStatus } from '@vendee-cinema/common'
import {
	ConfirmEmailChangeRequest,
	ConfirmPhoneChangeRequest,
	type GetAccountRequest,
	InitEmailChangeRequest,
	InitPhoneChangeRequest,
	Role
} from '@vendee-cinema/contracts/gen/account'

import { UserRepository } from '@/shared/repositories'

import { OtpService } from '../otp'

import { AccountRepository } from './account.repository'

@Injectable()
export class AccountService {
	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService
	) {}

	public async getAccount(data: GetAccountRequest) {
		const { id } = data
		const account = await this.accountRepository.findById(id)
		if (!account)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found'
			})
		return {
			id: account.id,
			phone: account.phone,
			email: account.email,
			role: account.role as Role,
			isPhoneVerified: account.isPhoneVerified,
			isEmailVerified: account.isEmailVerified
		}
	}

	public async initEmailChange(data: InitEmailChangeRequest) {
		const { email, userId } = data
		const existing = await this.userRepository.findByEmail(email)
		if (existing)
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: 'Email already in use'
			})

		const { code, hash } = await this.otpService.send(email, ContactType.EMAIL)
		console.log('CODE: ', code)

		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: ContactType.EMAIL,
			value: email,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		return { ok: true }
	}

	public async confirmEmailChange(data: ConfirmEmailChangeRequest) {
		const { code, email, userId } = data
		const pending = await this.accountRepository.findPendingChange(
			userId,
			ContactType.EMAIL
		)
		if (!pending)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Pending request not found'
			})
		if (pending.value !== email)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Email mismatch'
			})
		if (pending.expiresAt < new Date())
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Code expired'
			})
		await this.otpService.verify(pending.value, code, ContactType.EMAIL)
		await this.userRepository.update(userId, { email, isEmailVerified: true })
		await this.accountRepository.deletePendingChange(userId, ContactType.EMAIL)
		return { ok: true }
	}

	public async initPhoneChange(data: InitPhoneChangeRequest) {
		const { phone, userId } = data
		const existing = await this.userRepository.findByPhone(phone)
		if (existing)
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: 'Phone already in use'
			})
		const { code, hash } = await this.otpService.send(phone, ContactType.EMAIL)
		console.log('CODE: ', code)
		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: ContactType.EMAIL,
			value: phone,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})
		return { ok: true }
	}

	public async confirmPhoneChange(data: ConfirmPhoneChangeRequest) {
		const { code, phone, userId } = data
		const pending = await this.accountRepository.findPendingChange(
			userId,
			ContactType.PHONE
		)
		if (!pending)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Pending request not found'
			})
		if (pending.value !== phone)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Phone mismatch'
			})
		if (pending.expiresAt < new Date())
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Code expired'
			})
		await this.otpService.verify(pending.value, code, ContactType.PHONE)
		await this.userRepository.update(userId, { phone, isPhoneVerified: true })
		await this.accountRepository.deletePendingChange(userId, ContactType.PHONE)
		return { ok: true }
	}
}
