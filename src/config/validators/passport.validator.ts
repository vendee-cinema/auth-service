import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class PassportValidator {
	@IsString()
	@IsNotEmpty()
	public PASSPORT_SECRET_KEY: string

	@IsNumber()
	@IsNotEmpty()
	public PASSPORT_ACCESS_TTL: number

	@IsNumber()
	@IsNotEmpty()
	public PASSPORT_REFRESH_TTL: number
}
