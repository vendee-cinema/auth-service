import { IsInt, IsNotEmpty, IsString } from 'class-validator'

export class GrpcValidator {
	@IsString()
	@IsNotEmpty()
	public GRPC_HOST: string

	@IsInt()
	@IsNotEmpty()
	public GRPC_PORT: number

	@IsString()
	@IsNotEmpty()
	public USER_GRPC_URL: string
}
