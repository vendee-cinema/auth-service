import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import type {
	CreateUserRequest,
	UserServiceClient
} from '@vendee-cinema/contracts/user'

@Injectable()
export class UserClientGrpc implements OnModuleInit {
	private userService: UserServiceClient

	public constructor(
		@Inject('USER_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.userService = this.client.getService<UserServiceClient>('UserService')
	}

	public create(request: CreateUserRequest) {
		return this.userService.createUser(request)
	}
}
