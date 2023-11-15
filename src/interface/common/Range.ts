import {IsOptional} from "class-validator";

export class IDate {
    @IsOptional()
    start: string;
    @IsOptional()
    end: string;
}
export class IRange {
    @IsOptional()
    min: number;
    @IsOptional()
    max: number;
}
