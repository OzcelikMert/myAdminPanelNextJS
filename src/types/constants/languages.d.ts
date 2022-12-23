import {LanguageId} from "constants/index";

interface LanguageDocument {
    id: LanguageId,
    code: string,
    title: string,
    order: number,
    image: string
}

export {LanguageDocument}
