import {StatusDocument} from "types/constants";

enum StatusId {
    Active = 1,
    InProgress,
    Pending,
    Disabled,
    Banned,
    Deleted
}

const Status: Array<StatusDocument> = [
    {id: StatusId.Active, order: 1, langKey: "active"},
    {id: StatusId.InProgress, order: 2, langKey: "inProgress"},
    {id: StatusId.Pending, order: 3, langKey: "pending"},
    {id: StatusId.Disabled, order: 4, langKey: "disabled"},
    {id: StatusId.Banned, order: 5, langKey: "banned"},
    {id: StatusId.Deleted, order: 6, langKey: "deleted"}
]

export {Status, StatusId};
