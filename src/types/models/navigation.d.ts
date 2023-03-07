import {StatusId} from "constants/status";

export interface NavigationDocument {
    _id?: string
    statusId: StatusId,
    mainId?: string
    authorId: string
    lastAuthorId: string
    rank: number,
    contents: NavigationContentDocument
}

export interface NavigationContentDocument {
    _id?: string
    langId: string
    title?: string,
    url?: string,
}