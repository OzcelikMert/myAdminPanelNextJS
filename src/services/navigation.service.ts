import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import {
    NavigationAddParamDocument, NavigationDeleteParamDocument,
    NavigationDocument,
    NavigationGetParamDocument,
    NavigationUpdateParamDocument, NavigationUpdateStatusIdParamDocument
} from "types/services/navigation";

export default {
    get(params: NavigationGetParamDocument): Promise<ServiceResultDocument<NavigationDocument[], null>> {
        return Api.get({
            url: [ServicePages.navigation, params._id?.toString()],
            data: params,
        });
    },
    add(params: NavigationAddParamDocument) {
        return Api.post({
            url: [ServicePages.navigation],
            data: params,
        });
    },
    update(params: NavigationUpdateParamDocument) {
        return Api.put({
            url: [ServicePages.navigation, params._id.toString()],
            data: params,
        });
    },
    updateStatus(params: NavigationUpdateStatusIdParamDocument) {
        return Api.put({
            url: [ServicePages.navigation],
            data: params
        });
    },
    delete(params: NavigationDeleteParamDocument) {
        return Api.delete({
            url: [ServicePages.navigation],
            data: params,
        });
    },
}