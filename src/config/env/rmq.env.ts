import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils'

import type { RmqConfig } from '../interfaces'
import { RmqValidator } from '../validators'

export const rmqEnv = registerAs<RmqConfig>('rmq', () => {
	validateEnv(process.env, RmqValidator)
	return {
		url: process.env.RMQ_URL,
		notificationsQueue: process.env.RMQ_NOTIFICATIONS_QUEUE
	}
})
