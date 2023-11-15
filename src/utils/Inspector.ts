export default class Inspector {
    /**
     * 객체 내 키의 값 확인
     * @param body
     * @returns
     */
    static checkObjectProperty(body: any, checkEmpty: boolean = true): boolean {
        let result: boolean = true;
        const values = Object.values(body);
        values.map((item, index) => {
            if (item === undefined || item === null || (checkEmpty && typeof item === "string" && item.length === 0)) {
                result = false;
            }
        });

        return result;
    }

    /**
     * property가 values 내 포함여부 확인
     * @param property
     * @param values
     * @returns
     */
    static checkValidValue(property: string, values: string[] | any): boolean {
        if (!Array.isArray(values)) values = Object.values(values);
        if (!values || values.length == 0) return false;
        return values.includes(property);
    }

    /**
     * empty string 인지 체크
     * @param {string} _string_
     * @returns {boolean}
     */
    static isEmpty(_string_: string): boolean {
        return _string_ === undefined || _string_ === null || _string_.length === 0;
    }

    static compare(target: any, compare: any): boolean {
        for (const key in target) {
            if (compare[key] === undefined || compare[key] != target[key]) return true;
        }
        return false;
    }
}
