import { Injectable } from '@nestjs/common'
import { Account } from '@prisma/generated/client'
import { AccountCreateInput, AccountUpdateInput } from '@prisma/generated/models'

import { PrismaService } from '@/infrastructure/prisma'

@Injectable()
export class AuthRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async findByPhone(phone: string): Promise<Account | null> {
		return await this.prisma.account.findUnique({ where: { phone } })
	}

	public async findByEmail(email: string): Promise<Account | null> {
		return await this.prisma.account.findUnique({ where: { email } })
	}

	public async create(data: AccountCreateInput): Promise<Account> {
		return await this.prisma.account.create({ data })
	}

	public async update(id: string, data: AccountUpdateInput): Promise<Account> {
		return await this.prisma.account.update({ where: { id }, data })
	}
}
