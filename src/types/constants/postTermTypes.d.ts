import {PostTermTypeId} from "constants/index";
import LanguageKeys from "../languages";

interface PostTermTypeDocument {
    id: PostTermTypeId,
    order: number,
    langKey: LanguageKeys
}

export {
    PostTermTypeDocument
}
