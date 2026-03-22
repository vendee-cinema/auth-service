import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

export class RedisValidator {
	@IsString()
	@IsNotEmpty()
	public REDIS_USER: string

	@IsString()
	@IsNotEmpty()
	public REDIS_PASSWORD: string

	@IsString()
	@IsNotEmpty()
	public REDIS_HOST: string

	@IsInt()
	@Min(1)
	@Max(65535)
	@IsNotEmpty()
	public REDIS_PORT: number

	@IsInt()
	@IsNotEmpty()
	public REDIS_DB: number
}
