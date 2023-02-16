interface ServiceResultDocument<T, P = any> {
    data: T;
    customData: P;
    status: boolean;
    message: string;
    errorCode: number;
    statusCode: number;
    source: string | any;
}

export default ServiceResultDocument