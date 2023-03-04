import {ViewDocument} from "../models/view";

export type ViewGetResultDocument = {} & ViewDocument

export interface ViewGetParamDocument {
    ip?: string
    langId?: string
    url?: string
    country?: string
    city?: string
    region?: string
    dateStart?: Date
    dateEnd?: Date
}

export type ViewGetTotalResultDocument = {
    total: number
    _id: string
}

export interface ViewAddParamDocument {
    url: string,
    langId: string
    ip: string,
    country?: string,
    city?: string,
    region?: string
}

export interface ViewDeleteManyParamDocument {
    dateEnd: Date
}