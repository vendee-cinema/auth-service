import type { DatabaseConfig } from './database-config.interface'
import type { GrpcConfig } from './grpc-config.interface'
import type { RedisConfig } from './redis-config.interface'

export interface AllConfigs {
	database: DatabaseConfig
	grpc: GrpcConfig
	redis: RedisConfig
}
