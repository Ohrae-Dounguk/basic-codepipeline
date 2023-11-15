import Container from "typedi";
import {
    ConnectionOptions,
    createConnection,
    useContainer,
} from "typeorm";
import { TypeormLogger } from "./utils/TypeormLogger";
import { env } from "./env";

export async function createDatabaseConnection(): Promise<void> {
    try {
        const createConnectionOptions: ConnectionOptions = {
            name: "default",
            type: "mysql",
            host: env.database.host,
            port: env.database.port,
            username: env.database.username,
            password: env.database.password,
            database: env.database.database,
            synchronize: env.database.synchronize,
            logger: new TypeormLogger(),
            entities: [
                __dirname + "/entities/*{.ts,.js}",
                __dirname + "/entities/relations/*{.ts,.js}",
            ],
            migrations: [__dirname + "/migrations/*.ts"],
        };

        useContainer(Container);
        await createConnection(createConnectionOptions);
    } catch (error) {
        throw error;
    }
}