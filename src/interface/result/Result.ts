export class Result {
    success!: boolean; // true: 성공, false: 실패

    code?: string; // 응답 실패 처리 시
    message?: string; // 응답 실패 처리 시
    devMessage?: string; // 쿼리 오류 실패 메시지

    dataset?: any; // 응답 성공 처리 시
}
