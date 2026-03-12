import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@vendee-cinema/passport'

import { getPassportConfig } from '@/config/loaders'

import { TokenService } from './token.service'

@Module({
	imports: [
		PassportModule.registerAsync({
			useFactory: getPassportConfig,
			inject: [ConfigService]
		})
	],
	providers: [TokenService],
	exports: [TokenService]
})
export class TokenModule {}
