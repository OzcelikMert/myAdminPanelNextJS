import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import {
    ComponentAddParamDocument, ComponentDeleteParamDocument,
    ComponentDocument,
    ComponentGetParamDocument,
    ComponentUpdateParamDocument, ComponentUpdateRankParamDocument
} from "types/services/component";

export default {
    get(params: ComponentGetParamDocument): Promise<ServiceResultDocument<ComponentDocument[]>> {
        return Api.get({
            url: [ServicePages.component, params._id?.toString()],
            data: params,
        });
    },
    add(params: ComponentAddParamDocument) {
        return Api.post({
            url: [ServicePages.component],
            data: params,
        });
    },
    update(params: ComponentUpdateParamDocument) {
        return Api.put({
            url: [ServicePages.component, params._id.toString()],
            data: params,
        });
    },
    updateRank(params: ComponentUpdateRankParamDocument) {
        return Api.put({
            url: [ServicePages.component, "rank"],
            data: params,
        });
    },
    delete(params: ComponentDeleteParamDocument) {
        return Api.delete({
            url: [ServicePages.component],
            data: params,
        });
    },
}