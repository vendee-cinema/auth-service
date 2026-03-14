import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class RmqValidator {
	@Matches(/^amqp:\/\/[^:]+:[^@]+@[^:]+:\d+$/)
	@IsNotEmpty()
	public RMQ_URL: string

	@IsString()
	@IsNotEmpty()
	public RMQ_NOTIFICATIONS_QUEUE: string
}
