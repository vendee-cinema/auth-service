import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { AllConfigs } from '@/config/interfaces'

import { MessagingService } from './messaging.service'

@Global()
@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'NOTIFICATIONS_CLIENT',
				useFactory: (config: ConfigService<AllConfigs>) => ({
					transport: Transport.RMQ,
					options: {
						urls: [config.get<string>('rmq.url', { infer: true })],
						queue: config.get('rmq.notificationsQueue', {
							infer: true
						}),
						queueOptions: { durable: true }
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	providers: [MessagingService],
	exports: [MessagingService]
})
export class MessagingModule {}
