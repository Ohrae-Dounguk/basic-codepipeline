import {IsNotEmpty} from "class-validator";
import {BaseEntity} from "typeorm";

export class IPage {
    @IsNotEmpty()
    page: number;
    @IsNotEmpty()
    per_page: number;
}

export class IPageResult {
    @IsNotEmpty()
    total: number;
    @IsNotEmpty()
    total_page: number;
    @IsNotEmpty()
    page: number;
    @IsNotEmpty()
    per_page: number;
}

export class IPaginatedResult<T extends BaseEntity> {
    @IsNotEmpty()
    array: T[];
    @IsNotEmpty()
    meta: IPageResult;
}
