import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import type {
	EmailChangedEvent,
	PhoneChangedEvent
} from '@vendee-cinema/contracts/account'
import type { OtpRequestedEvent } from '@vendee-cinema/contracts/auth'

@Injectable()
export class MessagingService {
	public constructor(
		@Inject('NOTIFICATIONS_CLIENT') private readonly client: ClientProxy
	) {}

	public async otpRequested(data: OtpRequestedEvent) {
		return this.client.emit('auth.otp.requested', data)
	}

	public async emailChanged(data: EmailChangedEvent) {
		return this.client.emit('account.email.changed', data)
	}

	public async phoneChanged(data: PhoneChangedEvent) {
		return this.client.emit('account.phone.changed', data)
	}
}
