export interface ToastMessage {
    key: string;
    severity: string;
    summary: string;
    detail: string;
    sticky: boolean;
    life: number;

}