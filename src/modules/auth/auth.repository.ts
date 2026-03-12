import { Injectable } from '@nestjs/common'
import type { Account } from '@prisma/generated/client'
import type { AccountCreateInput } from '@prisma/generated/models'

import { PrismaService } from '@/infrastructure/prisma'

@Injectable()
export class AuthRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async create(data: AccountCreateInput): Promise<Account> {
		return await this.prisma.account.create({ data })
	}
}
