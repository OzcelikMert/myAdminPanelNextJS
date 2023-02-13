import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import {
    ViewNumberDocument,
    ViewStatisticsDocument
} from "types/services/view";

export default {
    getNumber(): Promise<ServiceResultDocument<ViewNumberDocument, null>> {
        return Api.get({
            url: [ServicePages.view, "number"]
        });
    },
    getStatistics(): Promise<ServiceResultDocument<ViewStatisticsDocument, null>> {
        return Api.get({
            url: [ServicePages.view, "statistics"]
        });
    }
}