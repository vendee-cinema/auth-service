import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { PROTO_PATHS } from '@vendee-cinema/contracts'

import { AllConfigs } from '@/config/interfaces'

import { UserClientGrpc } from './user.grpc'

@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'USER_PACKAGE',
				useFactory: (configService: ConfigService<AllConfigs>) => ({
					transport: Transport.GRPC,
					options: {
						package: 'user.v1',
						protoPath: PROTO_PATHS.USER,
						url: configService.get('grpc.clients.user', { infer: true })
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	providers: [UserClientGrpc],
	exports: [UserClientGrpc]
})
export class UserModule {}
