import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import LanguageDocument, {LanguageGetParamDocument} from "types/services/language";

export default {
    get(params: LanguageGetParamDocument): Promise<ServiceResultDocument<LanguageDocument[]>> {
        return Api.get({
            url: [ServicePages.language],
            data: params
        });
    },
}