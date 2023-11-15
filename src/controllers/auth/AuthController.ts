import { Request, Response } from "express";
import {
    Body,
    HttpCode,
    JsonController,
    Post,
    Req,
    Res,
    UseBefore,
} from "routing-controllers";

import { AuthService } from "../../services";
import { checkRefreshToken } from "../../middlewares";
import { errors, failure, Result, success } from "../../interface";

@JsonController("/auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * 로그인 요청 API
     * @param res
     * @param loginShop
     */
    @HttpCode(200)
    @Post("/auth")
    public async login(
        @Res() res: Response
    ): Promise<Result> {
        return success(res, null);
    }
}
