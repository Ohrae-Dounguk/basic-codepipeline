import {createLogger, format, Logger, LoggerOptions, loggers, transports} from "winston";
import {env} from "../env";
import {ELoggerSystemType, ELoggerType} from "../interface/enum";
import WinstonCloudWatch = require("winston-cloudwatch");
import DailyRotateFile = require("winston-daily-rotate-file");

const winstonCloudWatchOptions = {
    awsRegion: env.aws.region,
    awsAccessKeyId: env.aws.accessKeyId,
    awsSecretKey: env.aws.secretAccessKey,
    logGroupName: "ec2-log",
};

const {combine, timestamp, printf, prettyPrint, colorize, json, errors} = format;

const loggerFormat = combine(timestamp({format: "YYYY-MM-DD HH:mm:ss"}), errors({stack: true}));
const level = "debug";

const consoleOutputFormat = combine(
    colorize(),
    prettyPrint(),
    json(),
    printf((info) => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
    }),
);

const fileOutputFormat = combine(
    printf((info) => {
        if (info.stack) {
            return `${info.timestamp} ${info.level} ${info.message} : ${info.stack}`;
        }

        return `${info.timestamp} ${info.level}: ${info.message}`;
    }),
);

const consoleOptions: LoggerOptions = {
    level,
    exitOnError: false,
    format: loggerFormat,
    transports: [
        new transports.Console({
            handleExceptions: true,
            format: consoleOutputFormat,
        }),
    ],
};
const consoleLogger: Logger = createLogger(consoleOptions);
const stream = {
    write: (message: string) => {
        consoleLogger.info(message);
    },
};

// log 수집 방식 개발/운영 구분
const fnTransports = (sys_type: ELoggerSystemType, type: ELoggerType) => {
    let _filename: string;
    let _streamName: string;
    const error_filename: string = type !== ELoggerType.error ? `` : `-error`;
    switch (sys_type) {
        case ELoggerSystemType.default:
            _filename = `logs/system${error_filename}.log`;
            _streamName = `zeroeyes-server-api${error_filename}-log`;
            break;
        default:
            _filename = `logs/${sys_type}/system${error_filename}.log`;
            _streamName = `zeroeyes-server-${sys_type}-api${error_filename}-log`;
            break;
    }

    return env.isStaging
        ? [
              new WinstonCloudWatch({
                  ...winstonCloudWatchOptions,
                  logStreamName: _streamName,
              }),
          ]
        : [
              new DailyRotateFile({
                  handleExceptions: true,
                  zippedArchive: true,
                  maxSize: "1g",
                  format: fileOutputFormat,
                  filename: _filename,
              }),
          ];
};

/**
 * CreateLogger 여러번 실행 시 메모리 누수 경고로 인해 하나의 Logger에 여러개의 속성을 붙이는 방향으로 처리
 * @param system_type
 * @param type
 * @returns
 */
function getLogger(system_type: ELoggerSystemType, type: ELoggerType): Logger {
    if (!loggers.has(`${system_type}_${type}`)) {
        loggers.add(`${system_type}_${type}`, {
            transports: fnTransports(system_type, type),
            format: loggerFormat,
        });
    }

    return loggers.get(`${system_type}_${type}`);
}

export {stream, getLogger};
