import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import {
    ViewAddParamDocument,
    ViewNumberDocument,
    ViewStatisticsDocument
} from "types/services/view";

export default {
    getNumber(): Promise<ServiceResultDocument<ViewNumberDocument>> {
        return Api.get({
            url: [ServicePages.view, "number"]
        });
    },
    getStatistics(): Promise<ServiceResultDocument<ViewStatisticsDocument>> {
        return Api.get({
            url: [ServicePages.view, "statistics"]
        });
    }
}