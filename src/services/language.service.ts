import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import LanguageDocument, {
    LanguageAddParamDocument,
    LanguageGetParamDocument,
    LanguageUpdateParamDocument
} from "types/services/language";

export default {
    getFlags(params: {}): Promise<ServiceResultDocument<string[]>> {
        return Api.get({
            url: [ServicePages.language, "flags"],
            data: params
        });
    },
    get(params: LanguageGetParamDocument): Promise<ServiceResultDocument<LanguageDocument[]>> {
        return Api.get({
            url: [ServicePages.language, params._id],
            data: params
        });
    },
    add(params: LanguageAddParamDocument) {
        return Api.post({
            url: [ServicePages.language],
            data: params
        });
    },
    update(params: LanguageUpdateParamDocument) {
        return Api.put({
            url: [ServicePages.language, params._id.toString()],
            data: params
        });
    },
}