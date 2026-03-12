import type { DatabaseConfig } from './database-config.interface'
import type { GrpcConfig } from './grpc-config.interface'
import type { PassportConfig } from './passport-config.interface'
import type { RedisConfig } from './redis-config.interface'
import type { TelegramConfig } from './telegram.interface'

export interface AllConfigs {
	database: DatabaseConfig
	grpc: GrpcConfig
	passport: PassportConfig
	redis: RedisConfig
	telegram: TelegramConfig
}
