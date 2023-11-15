import Inspector from "./Inspector";
import {IDate, IObject, IRange} from "../interface";
import TimeParser from "./TimeParser";
import {LogicalOperator, QueryValueSet} from "../repositories/CommonRepository";

export default class QueryParser {
    /**
     * object 를 쿼리로 풀어 QueryValueSet 으로 변환
     * @param {IObject} entity
     * @param {string} replacePrefix
     * @param {(prefix: string, key: string) => string} getNonNullable
     * @param {(prefix: string, key: string) => string} getNullable
     * @param {string} alias
     * @returns {{query: string, values: any[]} | {query: string, values: any[]}}
     */
    static generateQueryValueSet(
        entity: IObject,
        replacePrefix: string,
        getNonNullable: (prefix: string, key: string) => string,
        getNullable: (prefix: string, key: string) => string,
        alias?: string,
    ) {
        let query_string = "";
        alias = alias ? `${alias}.` : "";
        const values: any[] = [];
        let prefix: string = "";
        if (!entity) {
            return {
                query: query_string,
                values: values,
            };
        }
        for (const key in entity) {
            if (entity[key] !== undefined) {
                if (entity[key] !== null) {
                    let value: any = entity[key];
                    if (typeof value == "string") {
                        value = value.replace(/'?'/g, "?");
                    }
                    values.push(value);
                    query_string += `${alias}${getNonNullable(prefix, key)}`;
                } else {
                    query_string += `${alias}${getNullable(prefix, key)}`;
                }
                prefix = replacePrefix;
            }
        }
        return {
            query: query_string,
            values: values,
        };
    }

    /**
     * 부품 : WHERE절 value set 자동화
     * @param {IObject} entity
     * @param {LogicalOperator} lo
     * @returns {QueryValueSet}
     * @private
     */
    static getConditionSet(entity: IObject, alias?: string, lo: LogicalOperator = LogicalOperator.AND): QueryValueSet {
        return this.generateQueryValueSet(
            entity,
            lo,
            (prefix: string, key: string) => `${prefix}${key}=?`,
            (prefix: string, key: string) => `${prefix}${key} IS NULL`,
        );
    }

    /**
     * 다중 쿼리를 한 쿼리로 조합
     * @param {string[]} queries
     * @param {string} separator
     * @param {boolean} use_brackets
     * @returns {string}
     */
    static combineRaw(queries: string[], lo: LogicalOperator = LogicalOperator.AND, use_brackets: boolean = true) {
        if (!queries || !Array.isArray(queries) || !lo) return "";
        let result = "";
        let suffix = "";
        let sb = "(";
        let eb = ")";
        if (!use_brackets) {
            sb = "";
            eb = "";
        }
        for (let i = 0; i < queries.length; ++i) {
            if (queries[i] && queries[i].length > 0) {
                result += `${suffix}${sb}${queries[i]}${eb}`;
                suffix = `${lo}`;
            }
        }
        return result;
    }

    /**
     * WHERE절 쿼리 조합 시 empty인지 체크 해 logical operator 추가
     * @param {string} query
     * @param {string} separator
     * @returns {string}
     */
    static checkEmpty(query: string, lo: LogicalOperator = LogicalOperator.AND) {
        let result = "";
        if (!Inspector.isEmpty(query)) {
            result = `${lo}(${query})`;
        }
        return result;
    }

    /**
     * query generator : 날짜 범위
     * @param {string} column_name
     * @param {IDate} date
     * @returns {string}
     * @protected
     */
    static getDateQueryThrow(column_name: string, date: IDate) {
        if (!column_name) throw "1002";

        if (!Inspector.isEmpty(date.start) || !Inspector.isEmpty(date.end)) {
            const qs = [];
            const start = TimeParser.toMomentThrow(date.start),
                end = TimeParser.toMomentThrow(date.end);
            if (start) {
                qs.push(`${column_name} > '${TimeParser.startOfDate(date.start)}'`);
            }
            if (end) {
                qs.push(`${column_name} < '${TimeParser.endOfDate(date.end)}'`);
            }
            if (qs.length > 0) {
                qs.push(`${column_name} IS NOT NULL`);
                return `${QueryParser.combineRaw(qs, LogicalOperator.AND, false)}`;
            }
        }
    }

    /**
     * query generator : 숫자 범위
     * @param {string} column_name
     * @param {IRange} range
     * @returns {string}
     * @protected
     */
    static getRangeQuery(column_name: string, range: IRange) {
        if (!column_name) throw "1002";
        if (range.min || range.max) {
            if (range.min && range.min && range.min > range.max) throw "3000";
            if (range.min < 0 || range.max < 0) throw "3000";
            const qs = [];
            if (range.min) {
                qs.push(`${column_name} > '${range.min}'`);
            }
            if (range.max) {
                qs.push(`${column_name} < '${range.max}'`);
            }
            if (qs.length > 0) {
                qs.push(`${column_name} IS NOT NULL`);
                qs.push(`${column_name} > 0`);
                return `${QueryParser.combineRaw(qs, LogicalOperator.AND, false)}`;
            }
        }
    }

    /**
     *  다중 쿼리셋을 한 쿼리셋으로 조합
     * @param {QueryValueSet[]} sets
     * @param {LogicalOperator} lo
     * @returns {QueryValueSet}
     */
    static combineSet(sets: QueryValueSet[], lo: LogicalOperator = LogicalOperator.AND): QueryValueSet {
        let suffix = "";
        let query_string = "";
        let values: string[] = [];
        for (let i = 0; i < sets.length; ++i) {
            if (sets[i] && sets[i].query.length > 0) {
                const _query_ = sets[i].query;
                let _values_ = sets[i].values;
                const value_count = (_query_.match(/\?/g) || []).length;
                query_string += `${suffix}(${_query_})`;
                if (sets[i].values.length > value_count) {
                    _values_ = _values_.slice(0, value_count);
                }
                values = values.concat(_values_);
                suffix = `${lo}`;
            }
        }
        return {
            query: query_string,
            values: values,
        };
    }
}
