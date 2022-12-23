import {PostTermTypeDocument} from "types/constants";

enum PostTermTypeId {
    Category = 1,
    Tag
}

const PostTermTypes: Array<PostTermTypeDocument> = [
    {id: PostTermTypeId.Category, order: 1, langKey: "category"},
    {id: PostTermTypeId.Tag, order: 2, langKey: "tag"},
]

export {PostTermTypes, PostTermTypeId};
