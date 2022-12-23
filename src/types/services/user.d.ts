import {StatusId, UserRoleId} from "constants/index";

export default interface UserDocument {
    _id: string
    roleId: UserRoleId,
    statusId: StatusId,
    image: string,
    name: string,
    comment: string,
    phone: string,
    email: string,
    password: string,
    permissions: number[],
    banDateEnd: Date,
    banComment: string,
    facebook: string,
    instagram: string,
    twitter: string,
    views: number,
    isOnline: boolean
}

export interface PopulateAuthorIdDocument {
    _id: string,
    name: string,
    email: string,
    url: string
}

export interface UsersGetParamDocument {
    userId?: string
}

export interface UserAddParamDocument {
    roleId: UserRoleId,
    statusId: StatusId,
    name: string,
    email: string,
    password: string,
    banDateEnd: string
    banComment: string
    permissions: number[]
}

export type UserUpdateParamDocument = {
    userId: string
} & UserAddParamDocument

export interface UserDeleteParamDocument {
    userId: string
}