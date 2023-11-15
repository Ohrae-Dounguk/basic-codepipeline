import Inspector from "./Inspector";
import moment, {Moment, unitOfTime} from "moment";
import {Coupon} from "../entities";
import {ICodeName} from "../interface";

const FULL_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const EXCLUDE_SECOND_FORMAT = "YYYY-MM-DD HH:mm";
const HOUR_FORMAT = "HH:mm:ss";
const DATE_FORMAT = "YYYY-MM-DD";
const WEEKDAYS: {[key: string]: string} = {
    mon: "월",
    tue: "화",
    wed: "수",
    thu: "목",
    fri: "금",
    sat: "토",
    sun: "일",
};
export {FULL_DATE_FORMAT, DATE_FORMAT, HOUR_FORMAT, WEEKDAYS};
export default class TimeParser {
    /**
     * 요일 코드
     * @returns {ICodeName[]}
     */
    static getAllWeeks(): ICodeName[] {
        const result: ICodeName[] = [];
        for (const key in WEEKDAYS) {
            result.push({code: key, name: WEEKDAYS[key]});
        }
        return result;
    }

    static getWeekString(weeks_string: string) {
        weeks_string = weeks_string.replace(/' '/g, "");
        if (weeks_string == "mon,tue,wed,thu,fri") return "평일";
        if (weeks_string == "sat,sun") return "주말";
        const weeks = weeks_string.split(",");
        let result = "";

        let nonCount = 0;
        let prefix = "";
        for (const key in WEEKDAYS) {
            if (weeks.indexOf(key) < 0) nonCount++;
            else {
                result += `${prefix}${WEEKDAYS[key]}`;
                prefix = ",";
            }
        }
        return nonCount == 0 ? "모든 요일" : result;
    }

    /**
     * string으로 입력된 시간 차이 계산
     * @param {string} start_at
     * @param {string} end_at
     * @returns {number}
     */
    static getTimeDiff = (start_at: string, end_at: string) => {
        let result = 0;
        const times = [];
        if (Inspector.isEmpty(start_at) || Inspector.isEmpty(end_at)) return result;
        const start_times = start_at.split(":");
        const end_times = end_at.split(":");
        if (start_times.length != 3 && end_times.length != 3) return result;

        for (let i = 0; i < 3; ++i) {
            times[i] = parseInt(end_times[i]) - parseInt(start_times[i]);
        }

        result = times[0] * 3600000 + times[1] * 60000 + times[2];

        return result;
    };

    static pod(num: number) {
        if (num < 10 && num >= 0) return `0${num}`;
        else return num;
    }

    private static formattedFullDate(date: Date) {
        return `${date.getFullYear()}-${this.pod(date.getMonth() + 1)}-${this.pod(date.getDate())} ${this.pod(
            date.getHours(),
        )}:${this.pod(date.getMinutes())}:${this.pod(date.getSeconds())}`;
    }

    static toDate(date: string) {
        if (date === undefined) return date;
        else {
            try {
                const _date_ = new Date(date);
                if (!Number.isNaN(_date_.getTime()) && _date_.getTime() !== 0) {
                    date = this.formattedFullDate(new Date(date));
                }
            } catch (e) {
                console.error(e);
            }
        }
        return date;
    }

    static toMomentThrow(date: string): moment.Moment {
        if (!Inspector.isEmpty(date)) {
            const m = moment(this.toDate(date));
            if (!m.isValid()) throw "3035";
            return m;
        }
    }

    static endOfDate(date?: string) {
        const date_moment = moment(moment(this.toDate(date)).format(DATE_FORMAT))
            .add(23, "h")
            .add(59, "m")
            .add(59, "s");
        return date_moment.format(FULL_DATE_FORMAT);
    }

    static startOfDate(date?: string) {
        const date_moment = moment(moment(this.toDate(date)).format(DATE_FORMAT));
        return date_moment.format(FULL_DATE_FORMAT);
    }

    static endOfWeek(date?: string): string {
        const WEEK_DAYS = 7;
        let now = moment(date).day();
        now -= 1; // to make monday is first
        if (now < 0) {
            now += WEEK_DAYS;
        } else if (now > WEEK_DAYS) {
            now -= WEEK_DAYS;
        }
        return this.endOfDate(
            moment(date)
                .add(WEEK_DAYS - 1 - now, "day")
                .format(FULL_DATE_FORMAT),
        );
    }

    static startOfWeek(date?: string): string {
        const WEEK_DAYS = 7;
        let now = moment(date).day();
        now -= 1; // to make monday is first
        if (now < 0) {
            now += WEEK_DAYS;
        } else if (now > WEEK_DAYS) {
            now -= WEEK_DAYS;
        }
        return this.startOfDate(moment(date).subtract(now, "day").format(FULL_DATE_FORMAT));
    }

    static endOfMonth(date?: string): string {
        let date_moment = moment(moment(date).format("YYYY-MM"));
        date_moment = date_moment.add(1, "month");
        date_moment = date_moment.subtract(1, "day");
        return this.endOfDate(date_moment.format(FULL_DATE_FORMAT));
    }

    static startOfMonth(date?: string): string {
        const date_moment = moment(moment(date).format("YYYY-MM"));
        return date_moment.format(FULL_DATE_FORMAT);
    }

    static addStringTime(from_date: string, add_time: string): string {
        const pieces = add_time.split(":"); // split it at the colons

        if (pieces.length != 3) return;

        const date_moment = moment(from_date)
            .add(+pieces[0], "h")
            .add(+pieces[1], "m")
            .add(pieces[2], "s");
        return date_moment.format(FULL_DATE_FORMAT);
    }

    static toFullDate(date: string | Moment | Date): string {
        return moment(date).format(FULL_DATE_FORMAT);
    }

    static toExcludeSecondDate(date: string | Moment | Date): string {
        return moment(date).format(EXCLUDE_SECOND_FORMAT);
    }

    static toDateOnly(date: string | Moment | Date): string {
        return moment(date).format(DATE_FORMAT);
    }

    static beforeMonth(before: number) {
        let now = moment();
        if (before) {
            now = now.subtract(before, "months");
            return now.format(FULL_DATE_FORMAT);
        }
    }

    static calculateEndDate(coupon: Coupon) {
        switch (coupon.end_date_type) {
            case "expire":
                return coupon.end_date_expire;
            case "period":
                return moment().add(coupon.end_date_period, "d").format("YYYY-MM-DD HH:mm:ss");
        }
        return null;
    }

    static now(): string {
        const now = moment();
        return now.format(FULL_DATE_FORMAT);
    }

    static nowDay = () => {
        const now_day = moment().day();
        if (now_day >= 0 && now_day < 7) {
            const weeks = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
            return weeks[now_day];
        }
    };

    static after(after: number, unit: unitOfTime.DurationConstructor = "minute"): string {
        let now = moment();
        if (after) {
            now = now.add(after, unit);
        }
        return now.format(FULL_DATE_FORMAT);
    }

    static before = (before: number, unit: unitOfTime.DurationConstructor = "minute") => {
        let now = moment();
        if (before) {
            now = now.subtract(before, unit);
            return now.format(FULL_DATE_FORMAT);
        }
    };
}
