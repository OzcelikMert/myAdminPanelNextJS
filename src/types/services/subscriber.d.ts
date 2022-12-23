export interface SubscriberDeleteParamDocument {
    _id: string[]
}

export interface SubscriberGetParamDocument {
    id?: string
    email?: string
}

export type SubscriberAddDocument = {
} & Omit<SubscriberDocument, "_id"|"createdAt">

export interface SubscriberDocument {
    _id: string
    email: string,
    createdAt: string
}