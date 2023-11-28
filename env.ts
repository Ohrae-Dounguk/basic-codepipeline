import dotenv from "dotenv";

dotenv.config({
    path: `config/.env.${process.env.NODE_ENV || "development"}`,
});

export const env = {
    type: process.env.NODE_ENV || "development",
    isStaging: process.env.NODE_ENV == "staging",
    isTest: process.env.NODE_ENV == "test",

    app: {
        port: Number(process.env.PORT) || 5000,
        apiPrefix: process.env.API_PREFIX || "/api",
    },
};
