import {Response} from "express";
import {QueryFailedError} from "typeorm";
import {ELoggerSystemType, ELoggerType, Result} from "../index";
import {ServiceError} from "../../middlewares";
import {getLogger} from "../../utils/Logger";

/**
 * 작업 수행 중 성공 케이스 발생 시 성공 처리, 데이터 삽입
 * @param res
 * @param dataset
 */
export function success(res: Response, dataset: any): Result {
    const result: Result = {
        success: true,
        dataset: dataset,
    };

    setLocals(res, result);
    return result;
}

/**
 * 작업 수행 중 실패 케이스 발생 시 실패 처리
 * @param res
 * @param result
 */
export function failure(res: Response, result: Result): Result {
    setLocals(res, result);
    return result;
}

/**
 * 요청에 대한 응답 시 Middleware를 통해 로그 처리용 데이터 추가
 * response를 직접 접근 시 응답 데이터 추출이 안되는 듯 하여 이렇게 처리함
 * @param res
 * @param result
 */
export function setLocals(res: Response, result: Result): void {
    res.locals.result = result;
}

/**
 * 예외발생 시 응답값에 SQL 오류메시지 추가
 * @param err
 * @returns
 */
export function setExceptMsg(err: any) {
    getLogger(ELoggerSystemType.default, ELoggerType.error).error(err);

    if (isQueryFailedError(err)) {
        return new ServiceError(errors["1002"], err.code);
    } else {
        if ("success" in err && "devMessage" in err) {
            return new ServiceError(errors[err.code], err.devMessage);
        } else {
            return new ServiceError(errors["0000"], err.code);
        }
    }
}

/**
 * 발생한 예외가 쿼리오류인지 판단
 * @param err
 * @returns
 */
function isQueryFailedError(err: any): boolean {
    return err instanceof QueryFailedError ? true : false;
}

/**
 * 오류 코드 모음
 */

export const errors: {[code: string]: Result} = {};

function generateError(code: string, message: string) {
    errors[code] = {
        success: false,
        code: code,
        message: message,
    };
}

{
    // Network
    generateError("0000", "Network Error");

    // Database
    generateError("1002", "Query error");
    generateError("1004", "Please try again later");

    // Authentication
    generateError("2000", "This ID does not exist");
    generateError("2001", "This ID already exists");
    generateError("2002", "This ID is no longer used");
    generateError("2003", "Administrator approval is required");
    generateError("2004", "Passwords do not match");
    generateError("2005", "Not logged in");
    generateError("2006", "Token creation error");
    generateError("2007", "Token authentication failed");
    generateError("2008", "You are not an administrator");
    generateError("2009", "You are not an administrator or a member");
    generateError("2010", "It is not your information");
    generateError("2011", "Authentication numbers do not match");
    generateError("2012", "The authentication time has expired");
    generateError("2013", "No password registerd");
    generateError("2014", "Can not change to the same password");
    generateError("2015", "Can not use the same number as your mobile number");
    generateError("2016", "Cancellation is impossible");
    generateError("2017", "Invalid shop");

    // Check value, status
    generateError("3000", "The parameter is invalid");
    generateError("3001", "Already exists");
    generateError("3002", "It does not exist");
    generateError("3003", "SMS transmission failed");
    generateError("3004", "Ticket time has expired");
    generateError("3005", "There is an amount due");
    generateError("3006", "Checked in already");
    generateError("3007", "Checked out already");
    generateError("3008", "It is already booked");
    generateError("3009", "Buy a season ticket first");
    generateError("3010", "Reserved seat");
    generateError("3011", "LIFX Smart-Bulb status change failed");
    generateError("3012", "Ticket Pass");
    generateError("3013", "It is not time for reservation");
    generateError("3014", "No Checked out processing available");
    generateError("3015", "No interlayer movement");
    generateError("3016", "Please assign seat");
    generateError("3017", "Ticket time has extensed");
    generateError("3018", "Can not be extended");
    generateError("3019", "Change is not available because there is a valid ticket");
    generateError("3020", "Ticket is not available time");
    generateError("3021", "Shop is not available time");
    generateError("3022", "Customer is a ticket in use");
    generateError("3023", "Only check out ticket");
    generateError("3024", "Unused tickets cannot be extended");
    generateError("3025", "This ticket is invalid at this shop");
    generateError("3026", "The status of the ticket cannot be changed");
    generateError("3030", "Contact Number is duplicated");
    generateError("3031", "Contact Number is not exist");
    generateError("3032", "Only 3 can be registered");
    generateError("3033", "Not allowed query input");
    generateError("3034", "This data is deprecated");
    generateError("3035", "Wrong date format is inserted");
    generateError("3036", "This data is not activated yet");
    generateError("3037", "Not supported");
    generateError("3040", "Related bulbs exist");
    generateError("3041", "The seat and bridge are under different shops");
    generateError("3042", "The layer of bridge and seat must be same");
    generateError("3043", "Existing bulbs are linked in multiple layer");
    generateError(
        "3044",
        "The layer of bridge what have bulbs can't be changed if the input and existing layer are different",
    );
    generateError("3045", "Duplicated bulb names are requested");

    // Payments
    generateError("4000", "인증에 실패하였습니다. API키와 secret을 확인하세요");
    generateError(
        "4001",
        "카드정보 인증 및 빌키 발급에 실패하였습니다. [F113]카드번호틀림 - 테스트모드에서는 KB카드 사용이 불가능합니다. (타카드는 테스트모드에서도 정상, KB카드도 실제 계약후에는 문제없음)",
    );
    generateError("4002", "결제/환불 요청 실패");
    generateError("4003", "결제 내역이 존재하지 않습니다");
    generateError("4004", "No more purchases");
    generateError("4010", "면세 결제 불가, 관리자 문의");
    generateError(
        "4099",
        "This is the card transaction history before the purchase. Please try again in a few minutes",
    );

    // Coupon
    generateError("4510", "Can NOT get day data");
    generateError("4511", "All requested customers already have this coupon");
    generateError("4512", "This coupon is already used");
    generateError("4601", "This coupon already have been used");
    generateError("4602", "You can not use this coupon at this condition");
    generateError("4603", "This coupon is unavailable to use");
    generateError("4604", "Exceed quantity to use");
    generateError("4605", "This seat is NOT available");
    generateError("4606", "The maximum number of coupon usage is 2 at once");
    generateError("4607", "Allocation mismatch");

    // Coupon automation
    generateError("4651", "Need to set template data first");
    generateError("4652", "This customer already have this type of coupon");
    generateError("4653", "Exceed quantity to issue");
    generateError("4654", "This data is not activated yet");

    // Coupon internal
    generateError("4700", "Passed wrong data");
    generateError("4701", "Improper candidate");
    generateError("4702", "Unavailable ticket data is inserted");
    generateError("4703", "This shop do NOT have entry");
    generateError("4704", "Can not calculate supplement time");

    // Hue
    generateError("5000", "No auth code for HUE connnection");
    generateError("5001", "Getting new token for HUE failed");
    generateError("5002", "Getting refresh token for HUE failed");
    generateError("5003", "No HUE token registered");
    generateError("5004", "Token for HUE already exists. Refresh token to get new token");
    generateError("5005", "Getting list of HUE lights failed");
    generateError("5006", "HUE Smart-Bulb status change failed");
    generateError("5007", "Invalid HUE token");
    generateError("5008", "Creating new user for the bridge failed");
    generateError("5009", "Link button NOT pressed. Press the bridge button to connect");
    generateError("5010", "The bridge_id already exists. Delete the bridge from the shop first and try again");
    generateError("5011", "No bridge Info");
    generateError("5012", "Invalid access token");
    generateError("5013", "Unauthorized user for the bridge");
    generateError("5014", "Can not delete the bridge. Delete all smart bulbs connected to the bridge first");

    // E-pass
    generateError("6001", "E-PASS does not exist");
    generateError("6002", "Contact the Administrator");
    generateError("6010", "Does Not Empty E-PASS Profile");
    generateError("6011", "E-PASS Registration required");

    // Analytics
    generateError("7001", "Incorrect format file name. {shop_name}_{shop_id}.pdf. ** All files do not apply **");

    // Thermal
    generateError("8011", "Thermal required");

    // Biz Message
    generateError("9001", "Template is not valid");
}

// export default errors;
export default {};
