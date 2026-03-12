import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class TelegramValidator {
	@IsString()
	@IsNotEmpty()
	public TELEGRAM_BOT_ID: string

	@IsString()
	@IsNotEmpty()
	public TELEGRAM_BOT_TOKEN: string

	@IsString()
	@IsNotEmpty()
	public TELEGRAM_BOT_USERNAME: string

	@IsUrl()
	@IsNotEmpty()
	public TELEGRAM_REDIRECT_ORIGIN: string
}
