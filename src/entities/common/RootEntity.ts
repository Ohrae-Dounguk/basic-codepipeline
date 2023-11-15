import { BaseEntity } from "typeorm";

export class RootEntity extends BaseEntity {
    public checkEmptyAndUpdate(key: string, obj: { [key: string]: any }) {
        const self = this as { [key: string]: any };
        if (obj[key] != undefined) self[key] = obj[key];
    }
}
