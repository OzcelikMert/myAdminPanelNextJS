import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import PostTermDocument, {
    PostTermDeleteParamDocument,
    PostTermGetParamDocument,
    PostTermAddParamDocument,
    PostTermUpdateStatusParamDocument, PostTermUpdateParamDocument
} from "types/services/postTerm";

export default {
    get(params: PostTermGetParamDocument): Promise<ServiceResultDocument<PostTermDocument[]>> {
        let typeId = Array.isArray(params.typeId) ? [] : [params.typeId?.toString()]
        return Api.get({
            url: [ServicePages.postTerm, params.postTypeId.toString(), ...typeId, params.termId?.toString()],
            data: params
        });
    },
    add(params: PostTermAddParamDocument) {
        return Api.post({
            url: [ServicePages.postTerm, params.postTypeId.toString(), params.typeId.toString()],
            data: params
        });
    },
    update(params: PostTermUpdateParamDocument) {
        return Api.put({
            url: [ServicePages.postTerm, params.postTypeId.toString(), params.typeId.toString(), params.termId.toString()],
            data: params
        });
    },
    updateStatus(params: PostTermUpdateStatusParamDocument) {
        return Api.put({
            url: [ServicePages.postTerm, params.postTypeId.toString(), params.typeId.toString()],
            data: params
        });
    },
    delete(params: PostTermDeleteParamDocument) {
        return Api.delete({
            url: [ServicePages.postTerm, params.postTypeId.toString(), params.typeId.toString()],
            data: params
        });
    },
}