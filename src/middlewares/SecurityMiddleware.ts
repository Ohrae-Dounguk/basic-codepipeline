import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import helmet from "helmet";

@Middleware({ type: "before" })
export class SecurityMiddleware implements ExpressMiddlewareInterface {
    use(req: Request, res: Response, next: NextFunction): any {
        const cdnjs = "https://cdnjs.cloudflare.com";
        return helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", cdnjs],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                },
            },
        })(req, res, next);
    }
}
