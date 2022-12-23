import {PostTypeDocument} from "types/constants";

enum PostTypeId {
    Blog = 1,
    Portfolio,
    Page,
    Slider,
    Reference,
    Service,
    Testimonial,
    Navigate
}

const PostTypes: Array<PostTypeDocument> = [
    {id: PostTypeId.Blog, order: 1, langKey: "blogs"},
    {id: PostTypeId.Portfolio, order: 2, langKey: "portfolios"},
    {id: PostTypeId.Page, order: 3, langKey: "pages"},
    {id: PostTypeId.Slider, order: 4, langKey: "sliders"},
    {id: PostTypeId.Reference, order: 5, langKey: "references"},
    {id: PostTypeId.Service, order: 6, langKey: "services"},
    {id: PostTypeId.Testimonial, order: 7, langKey: "testimonials"},
    {id: PostTypeId.Navigate, order: 8, langKey: "navigates"}
]

export {PostTypes, PostTypeId};
