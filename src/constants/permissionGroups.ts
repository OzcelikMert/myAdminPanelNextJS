import {PermissionGroupDocument} from "types/constants";

enum PermissionGroupId {
    Blog = 1,
    Portfolio,
    Slider,
    Reference,
    Gallery,
    User,
    Page,
    Navigation,
    Settings,
    Service,
    Testimonial,
    Subscriber,
    Component,
    StaticLanguage,
    Product,
    ECommerce,
    BeforeAndAfter
}

const PermissionGroups: Array<PermissionGroupDocument> = [
    {id: PermissionGroupId.Blog, order: 1, langKey: "blogs"},
    {id: PermissionGroupId.Portfolio, order: 2, langKey: "portfolios"},
    {id: PermissionGroupId.Slider, order: 3, langKey: "sliders"},
    {id: PermissionGroupId.Reference, order: 4, langKey: "references"},
    {id: PermissionGroupId.Gallery, order: 5, langKey: "gallery"},
    {id: PermissionGroupId.User, order: 6, langKey: "users"},
    {id: PermissionGroupId.Page, order: 7, langKey: "pages"},
    {id: PermissionGroupId.Navigation, order: 8, langKey: "navigations"},
    {id: PermissionGroupId.Settings, order: 9, langKey: "settings"},
    {id: PermissionGroupId.Service, order: 10, langKey: "services"},
    {id: PermissionGroupId.Testimonial, order: 11, langKey: "testimonials"},
    {id: PermissionGroupId.Subscriber, order: 12, langKey: "subscribers"},
    {id: PermissionGroupId.Component, order: 13, langKey: "components"},
    {id: PermissionGroupId.StaticLanguage, order: 14, langKey: "staticLanguages"},
    {id: PermissionGroupId.ECommerce, order: 15, langKey: "eCommerce"},
    {id: PermissionGroupId.Product, order: 16, langKey: "product"},
    {id: PermissionGroupId.BeforeAndAfter, order: 16, langKey: "beforeAndAfter"},
]

export {PermissionGroups, PermissionGroupId}