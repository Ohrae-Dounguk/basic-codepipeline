import { NextFunction, Request, Response } from "express";

export function checkPagination(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const page = req.query.page ? req.query.page || 1 : 1;
    const per_page = req.query.per_page ? req.query.per_page || 30 : 30;
    res.locals.page = {
        page: page,
        per_page: per_page,
    };
    next();
}
