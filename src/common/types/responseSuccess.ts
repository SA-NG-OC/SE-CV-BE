export default class ResponseSuccess {
    success: boolean;
    message: string;
    data: any;

    constructor(message: string, data: any) {
        this.success = true;
        this.message = message;
        this.data = data;
    }
}
