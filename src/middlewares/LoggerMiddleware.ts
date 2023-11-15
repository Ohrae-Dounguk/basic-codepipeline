import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { logger } from "../utils/Logger";
import moment from "moment";

@Middleware({ type: "before" })
export class LoggerBeforeHandler implements ExpressMiddlewareInterface {
    use(req: Request, res: Response, next: NextFunction): any {
        if (req.baseUrl.startsWith("/public_server.socket.io/")) {
            return;
        }
        const obj: { [key: string]: any } = {
            headers: req.headers,
            query: req.query,
            params: req.params,
            body: req.body,
        };

        logger.info(`${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}\n === ${req.method} ${req.path} >>>\nInput\n${JSON.stringify(obj, null, 4)}`);
        next();
    }
}

@Middleware({ type: "after" })
export class LoggerAfterHandler implements ExpressMiddlewareInterface {
    use(req: Request, res: Response, next: NextFunction): any {
        if (req.baseUrl.startsWith("/public_server.socket.io/")) {
            return;
        }
        
        if (res.locals.result) {
            logger.info(`${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}\n === ${req.method} ${req.path} <<<\nOutput\n${JSON.stringify(res.locals.result, null, 4)}`);
        } else {
            logger.info(`${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}\n === ${req.method} ${req.path} <<<`);
        }
        next();
    }
}
