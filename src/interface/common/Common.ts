import {IsOptional} from "class-validator";
import {JSONSchema} from "class-validator-jsonschema";

export type IObject = {[key: string]: any};
@JSONSchema({
    properties: {
        data: {type: "object"},
    },
})
export class IHelperRequest {
    @IsOptional()
    data: IObject;
}

@JSONSchema({
    properties: {
        code: {type: "string"},
        name: {type: "string"},
    },
})
export class ICodeName {
    @IsOptional()
    code: string;
    @IsOptional()
    name: string;
}
