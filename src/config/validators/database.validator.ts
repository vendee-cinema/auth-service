import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

export class DatabaseValidator {
	@IsString()
	@IsNotEmpty()
	public DATABASE_USER: string

	@IsString()
	@IsNotEmpty()
	public DATABASE_PASSWORD: string

	@IsString()
	@IsNotEmpty()
	public DATABASE_HOST: string

	@IsInt()
	@Min(1)
	@Max(65535)
	@IsNotEmpty()
	public DATABASE_PORT: number

	@IsString()
	@IsNotEmpty()
	public DATABASE_NAME: string
}
