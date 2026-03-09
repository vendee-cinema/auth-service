import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { type MicroserviceOptions, Transport } from '@nestjs/microservices'

import { AppModule } from './app.module'
import type { AllConfigs } from './config/interfaces'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService<AllConfigs>)

	const host = config.get('grpc.host', { infer: true })
	const port = config.get('grpc.port', { infer: true })
	const url = `${host}:${port}`

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: 'auth.v1',
			protoPath: 'node_modules/@vendee-cinema/contracts/proto/auth.proto',
			url,
			loader: {
				keepCase: false,
				longs: String,
				enums: String,
				defaults: true,
				oneofs: true
			}
		}
	})

	await app.startAllMicroservices()
	await app.init()
}
bootstrap()
