import { NextFunction, Request, Response } from "express";
import {
    ExpressErrorMiddlewareInterface,
    Middleware,
} from "routing-controllers";
import { logger } from "../utils/Logger";
import moment from "moment";

@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, req: Request, res: Response, next: NextFunction): void {
        logger.error(`${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}\n === ${req.method} ${req.path} <<<\nOutput\n${error}`);
    }
}
