import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { Logger, QueryRunner } from "typeorm";
import { Logger as WinstonLogger, createLogger, format } from "winston";
import WinstonCloudWatch = require("winston-cloudwatch");
import DailyRotateFile = require("winston-daily-rotate-file");
import { env } from "../env";

const winstonCloudWatchOptions = {
    awsRegion: env.aws.region,
    awsAccessKeyId: env.aws.accessKeyId,
    awsSecretKey: env.aws.secretAccessKey,
    logGroupName: "ec2-log",
};

export class TypeormLogger implements Logger {
    private readonly queryLogger: WinstonLogger;
    private readonly schemeLogger: WinstonLogger;
    private readonly customFormat: any;

    private logDirectory: string = "queryLogs";
    private level: string = env.isStaging ? "error" : "debug";

    constructor() {
        this.existDirectory();

        this.customFormat = format.printf(
            ({ message, level, label, timestamp }) =>
                `${timestamp} [${label}] ${level} ${message}`,
        );

        const options = (filename: string) => ({
            format: this.customFormat,
            transports: [
                new DailyRotateFile({
                    handleExceptions: true,
                    format: this.customFormat,
                    filename: join(this.logDirectory, `${filename}-%DATE%.log`),
                }),
                // new WinstonCloudWatch({
                //     ...winstonCloudWatchOptions,
                //     logStreamName: "data-server-api-query-log"
                // })
            ],
        });

        this.queryLogger = createLogger(options("query.log"));
        this.schemeLogger = createLogger(options("schema.log"));
    }

    existDirectory() {
        if (!existsSync(this.logDirectory)) {
            mkdirSync(this.logDirectory);
        }
    }

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        if (env.type == "development") {
            this.queryLogger.info({
                level: this.level,
                message: `${query} - ${
                    parameters ? JSON.stringify(parameters) : ""
                }`,
                timestamp: Date.now(),
                label: "query",
            });
        }
    }

    logQueryError(
        error: string,
        query: string,
        parameters?: any[],
        queryRunner?: QueryRunner,
    ) {
        this.queryLogger.error({
            level: this.level,
            message: `${query} - ${
                parameters ? JSON.stringify(parameters) : ""
            }\n${error}`,
            timestamp: Date.now(),
            label: "query.error",
        });
    }

    logQuerySlow(
        time: number,
        query: string,
        parameters?: any[],
        queryRunner?: QueryRunner,
    ) {
        this.queryLogger.info({
            level: this.level,
            message: `[${time}] - ${query} - ${
                parameters ? JSON.stringify(parameters) : ""
            }`,
            timestamp: Date.now(),
            label: "query.slow",
        });
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        this.schemeLogger.info({
            level: this.level,
            message,
            timestamp: Date.now(),
            label: "schema",
        });
    }

    logMigration(message: string, queryRunner?: QueryRunner) {
        // throw new Error('Method not implemented.');
    }

    log(
        level: "log" | "info" | "warn" | "error",
        message: any,
        queryRunner?: QueryRunner,
    ) {
        // throw new Error('Method not implemented.');
    }
}
