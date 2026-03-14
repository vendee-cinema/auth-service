import { Injectable } from '@nestjs/common'
import type { Account, PendingContactChange } from '@prisma/generated/client'
import { ContactType } from '@prisma/generated/enums'

import { PrismaService } from '@/infrastructure/prisma'

@Injectable()
export class AccountRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async findById(id: string): Promise<Account | null> {
		return await this.prisma.account.findUnique({ where: { id } })
	}

	public findPendingChange(
		accountId: string,
		type: ContactType
	): Promise<PendingContactChange> {
		return this.prisma.pendingContactChange.findUnique({
			where: { accountId_type: { accountId, type } }
		})
	}

	public upsertPendingChange(data: {
		accountId: string
		type: ContactType
		value: string
		codeHash: string
		expiresAt: Date
	}): Promise<PendingContactChange> {
		const { accountId, type } = data
		return this.prisma.pendingContactChange.upsert({
			where: { accountId_type: { accountId, type } },
			create: data,
			update: data
		})
	}

	public deletePendingChange(
		accountId: string,
		type: ContactType
	): Promise<PendingContactChange> {
		return this.prisma.pendingContactChange.delete({
			where: { accountId_type: { accountId, type } }
		})
	}
}
