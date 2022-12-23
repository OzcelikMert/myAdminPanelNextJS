import {PostTypeId} from "constants/index";
import LanguageKeys from "../languages";

interface PostTypeDocument {
    id: PostTypeId,
    order: number,
    langKey: LanguageKeys
}

export {
    PostTypeDocument
}
