import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import PostDocument, {
    PostDeleteParamDocument,
    PostGetParamDocument,
    PostAddParamDocument,
    PostUpdateParamDocument, PostUpdateStatusParamDocument
} from "types/services/post";

export default {
    get(params: PostGetParamDocument): Promise<ServiceResultDocument<PostDocument[]>> {
        let url = Array.isArray(params.typeId) ? [] : [params.typeId?.toString(), params.postId?.toString()]
        return Api.get({
            url: [ServicePages.post, ...url],
            data: params
        });
    },
    add(params: PostAddParamDocument) {
        return Api.post({
            url: [ServicePages.post, params.typeId.toString()],
            data: params
        });
    },
    update(params: PostUpdateParamDocument) {
        return Api.put({
            url: [ServicePages.post, params.typeId.toString(), params.postId.toString()],
            data: params
        });
    },
    updateStatus(params: PostUpdateStatusParamDocument) {
        return Api.put({
            url: [ServicePages.post, params.typeId.toString()],
            data: params
        });
    },
    delete(params: PostDeleteParamDocument) {
        return Api.delete({
            url: [ServicePages.post, params.typeId.toString()],
            data: params
        });
    },
}