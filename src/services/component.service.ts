import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import {
    ComponentAddParamDocument, ComponentDeleteParamDocument,
    ComponentDocument,
    ComponentGetParamDocument,
    ComponentUpdateParamDocument
} from "types/services/component";

export default {
    get(params: ComponentGetParamDocument): Promise<ServiceResultDocument<ComponentDocument[]>> {
        return Api.get({
            url: [ServicePages.component, params.componentId?.toString()],
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
            url: [ServicePages.component, params.componentId.toString()],
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