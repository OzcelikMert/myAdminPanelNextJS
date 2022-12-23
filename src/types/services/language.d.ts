import {StatusId} from "constants/index";

export default interface LanguageDocument {
    _id: string
    title: string
    image: string
    shortKey: string
    locale: string
    statusId: StatusId
}

export interface LanguageGetParamDocument {
    id?: string
}