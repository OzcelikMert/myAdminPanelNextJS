export default interface ViewDocument {
    _id: string
    url: string,
    languageId: string
    ip: string,
    country: string,
    city: string,
    region: string
}

export interface ViewNumberDocument {
    liveTotal: number,
    averageTotal: number,
    weeklyTotal: number
}

export interface ViewStatisticsDocument {
    day: {total: number, _id: string}[]
    country: {total: number, _id: string}[]
}

export interface ViewAddParamDocument {
    url: string
    lang: string
}
