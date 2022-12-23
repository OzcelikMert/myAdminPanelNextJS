interface ServiceResultDocument<T> {
    data: T;
    customData: any;
    status: boolean;
    message: string;
    errorCode: number;
    statusCode: number;
    source: string | any;
}

export default ServiceResultDocument