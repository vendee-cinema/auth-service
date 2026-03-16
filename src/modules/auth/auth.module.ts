import { Module } from '@nestjs/common'

import { UserRepository } from '@/shared/repositories'

import { OtpService } from '../otp'
import { TokenService } from '../token'
import { UserModule } from '../user'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	imports: [UserModule],
	controllers: [AuthController],
	providers: [AuthService, UserRepository, OtpService, TokenService]
})
export class AuthModule {}
