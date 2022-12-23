import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import {
    SubscriberAddDocument,
    SubscriberDeleteParamDocument,
    SubscriberDocument,
    SubscriberGetParamDocument
} from "types/services/subscriber";

export default {
    get(params: SubscriberGetParamDocument): Promise<ServiceResultDocument<SubscriberDocument[]>> {
        return Api.get({
            url: [ServicePages.subscriber],
            data: params
        });
    },
    add(params: SubscriberAddDocument) {
        return Api.post({
            url: [ServicePages.subscriber],
            data: params
        });
    },
    delete(params: SubscriberDeleteParamDocument) {
        return Api.delete({
            url: [ServicePages.subscriber],
            data: params
        });
    },
}