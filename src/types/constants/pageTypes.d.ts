import {PageTypeId} from "constants/index";
import LanguageKeys from "../languages";

interface PageTypeDocument {
    id: PageTypeId,
    order: number,
    langKey: LanguageKeys
}

export {
    PageTypeDocument
}
