import dotenv from "dotenv";

dotenv.config({
    path: `config/.env.${process.env.NODE_ENV || "development"}`,
});

export const env = {
    type: process.env.NODE_ENV || "development",
    isStaging: process.env.NODE_ENV === "staging",
    isTest: process.env.NODE_ENV === "test",

    app: {
        port: Number(process.env.PORT) || 5000,
        apiPrefix: process.env.API_PREFIX || "/api",
        jwtAccessSecret: process.env.JWT_SECRET_ACCESS_KEY,
        jwtRefreshSecret: process.env.JWT_SECRET_REFRESH_KEY,
    },

    aws: {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESSKEY_ID,
        secretAccessKey: process.env.AWS_SECRETACCESSKEY,
    },

    database: {
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT) || 3306,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
    },
};
