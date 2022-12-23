import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import {GalleryDeleteParamDocument, GalleryAddParamDocument} from "types/services/gallery";
import {ApiRequestParamDocument} from "types/services/api";

export default {
    get(): Promise<ServiceResultDocument<string[]>> {
        return Api.get({
            url: [ServicePages.gallery],
        });
    },
    add(params: GalleryAddParamDocument, onUploadProgress: ApiRequestParamDocument["onUploadProgress"]) {
        return Api.post({
            url: [ServicePages.gallery],
            data: params,
            contentType: false,
            processData: false,
            onUploadProgress: onUploadProgress
        });
    },
    delete(params: GalleryDeleteParamDocument) {
        return Api.delete({
            url: [ServicePages.gallery],
            data: params
        });
    },
}