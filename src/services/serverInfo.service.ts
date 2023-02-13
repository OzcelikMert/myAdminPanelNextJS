import Api from "./api";
import {ServicePages} from "constants/index";
import ServiceResultDocument from "types/services/api/result";
import ServerInfoDocument from "types/services/serverInfo";

export default {
    get(): Promise<ServiceResultDocument<ServerInfoDocument, null>> {
        return Api.get({
            url: [ServicePages.serverInfo]
        });
    },
}