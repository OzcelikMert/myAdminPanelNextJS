import {PageTypeDocument} from "types/constants/pageTypes";

enum PageTypeId {
    Default = 1,
    HomePage,
    Blogs,
    Contact
}

const PageTypes: Array<PageTypeDocument> = [
    {id: PageTypeId.Default, order: 1, langKey: "default"},
    {id: PageTypeId.HomePage, order: 2, langKey: "homePage"},
    {id: PageTypeId.Blogs, order: 3, langKey: "blogs"},
    {id: PageTypeId.Contact, order: 4, langKey: "contact"},
]

export {PageTypes, PageTypeId};
