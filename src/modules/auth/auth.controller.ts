import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import type {
	RefreshRequest,
	RefreshResponse,
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse
} from '@vendee-cinema/contracts/auth'

import { AuthService } from './auth.service'

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@GrpcMethod('AuthService', 'SendOtp')
	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		return await this.authService.sendOtp(data)
	}

	@GrpcMethod('AuthService', 'VerifyOtp')
	public async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		return await this.authService.verifyOtp(data)
	}

	@GrpcMethod('AuthService', 'Refresh')
	public async refresh(data: RefreshRequest): Promise<RefreshResponse> {
		return await this.authService.refresh(data)
	}
}
