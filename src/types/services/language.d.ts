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
    _id?: string
}

export type LanguageUpdateParamDocument = {
    _id: string
} & LanguageAddParamDocument

export type LanguageAddParamDocument = {} & Omit<LanguageDocument, "_id">

