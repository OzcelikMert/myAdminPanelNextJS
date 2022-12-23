import {StatusId} from "constants/index";
import LanguageKeys from "../languages";

interface StatusDocument {
    id: StatusId,
    order: number,
    langKey: LanguageKeys
}

export {
    StatusDocument
}
