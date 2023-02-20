import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import PostDocument, {
    PostDeleteParamDocument,
    PostGetParamDocument,
    PostAddParamDocument,
    PostUpdateParamDocument, PostUpdateStatusParamDocument, PostUpdateViewParamDocument, PostUpdateRankParamDocument
} from "types/services/post";

export default {
    get(params: PostGetParamDocument): Promise<ServiceResultDocument<PostDocument[], {allCount?: number}>> {
        let url = Array.isArray(params.typeId) ? [] : [params.typeId?.toString(), params._id?.toString()]
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
            url: [ServicePages.post, params.typeId.toString(), params._id.toString()],
            data: params
        });
    },
    updateStatus(params: PostUpdateStatusParamDocument) {
        return Api.put({
            url: [ServicePages.post, "status", params.typeId.toString()],
            data: params
        });
    },
    updateRank(params: PostUpdateRankParamDocument) {
        return Api.put({
            url: [ServicePages.post, "rank", params.typeId.toString()],
            data: params
        });
    },
    updateView(params: PostUpdateViewParamDocument) {
        return Api.put({
            url: [ServicePages.post, "view", params.typeId.toString(), params._id.toString()],
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