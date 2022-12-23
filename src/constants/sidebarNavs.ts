import {PermissionId} from "./permissions";
import {PostTypeId} from "./postTypes";
import {UserRoleId} from "./userRoles";
import PagePaths from "./pagePaths";
import LanguageKeys from "types/languages";

export interface SideBarPath {
    path: string,
    title: LanguageKeys,
    icon?: string,
    state?: string,
    subPaths?: SideBarPath[]
    permId?: PermissionId
    roleId?: UserRoleId
}

const SidebarNav: SideBarPath[] = [
    {path: PagePaths.dashboard(), icon: `home`, title: "dashboard"},
    {
        path: PagePaths.gallery().self(),
        icon: `image-multiple`,
        title: "gallery",
        state: `gallery`,
        subPaths: [
            {
                path: PagePaths.gallery().upload(),
                icon: `upload`,
                title: "upload",
                permId: PermissionId.GalleryEdit,
            },
            {path: PagePaths.gallery().list(), title: "list"}
        ]
    },
    {
        path: PagePaths.post(PostTypeId.Navigate).self(),
        icon: `navigation-variant`,
        title: "navigates",
        state: `navigates`,
        subPaths: [
            {
                path: PagePaths.post(PostTypeId.Navigate).add(),
                title: "add",
                permId: PermissionId.NavigateAdd
            },
            {path: PagePaths.post(PostTypeId.Navigate).list(), title: "list"}
        ]
    },
    {
        path: PagePaths.post(PostTypeId.Page).self(),
        icon: `note-multiple`,
        title: "pages",
        state: `pages`,
        subPaths: [
            {
                path: PagePaths.post(PostTypeId.Page).add(),
                title: "add",
                permId: PermissionId.PageAdd
            },
            {path: PagePaths.post(PostTypeId.Page).list(), title: "list"}
        ]
    },
    {
        path: PagePaths.themeContent().self(),
        icon: `collage`,
        title: "themeContents",
        state: `themeContents`,
        subPaths: [
            {
                path: PagePaths.themeContent().post(PostTypeId.Blog).self(),
                title: "blogs",
                state: `blogs`,
                subPaths: [
                    {
                        path: PagePaths.themeContent().post(PostTypeId.Blog).add(),
                        title: "add",
                        permId: PermissionId.BlogAdd
                    },
                    {path: PagePaths.themeContent().post(PostTypeId.Blog).list(), title: "list"}
                ]
            },
            {
                path: PagePaths.themeContent().post(PostTypeId.Portfolio).self(),
                title: "portfolios",
                state: `portfolios`,
                subPaths: [
                    {
                        path: PagePaths.themeContent().post(PostTypeId.Portfolio).add(),
                        title: "add",
                        permId: PermissionId.PortfolioAdd
                    },
                    {path: PagePaths.themeContent().post(PostTypeId.Portfolio).list(), title: "list"}
                ]
            },
            {
                path: PagePaths.themeContent().post(PostTypeId.Slider).self(),
                title: "sliders",
                state: `sliders`,
                subPaths: [
                    {
                        path: PagePaths.themeContent().post(PostTypeId.Slider).add(),
                        title: "add",
                        permId: PermissionId.SliderAdd
                    },
                    {path: PagePaths.themeContent().post(PostTypeId.Slider).list(), title: "list"}
                ]
            },
            {
                path: PagePaths.themeContent().post(PostTypeId.Reference).self(),
                title: "references",
                state: `references`,
                subPaths: [
                    {
                        path: PagePaths.themeContent().post(PostTypeId.Reference).add(),
                        title: "add",
                        permId: PermissionId.ReferenceAdd
                    },
                    {path: PagePaths.themeContent().post(PostTypeId.Reference).list(), title: "list"}
                ]
            },
            {
                path: PagePaths.themeContent().post(PostTypeId.Service).self(),
                title: "services",
                state: `services`,
                subPaths: [
                    {
                        path: PagePaths.themeContent().post(PostTypeId.Service).add(),
                        title: "add",
                        permId: PermissionId.ServiceAdd
                    },
                    {path: PagePaths.themeContent().post(PostTypeId.Service).list(), title: "list"}
                ]
            },
            {
                path: PagePaths.themeContent().post(PostTypeId.Testimonial).self(),
                title: "testimonials",
                state: `testimonials`,
                subPaths: [
                    {
                        path: PagePaths.themeContent().post(PostTypeId.Testimonial).add(),
                        title: "add",
                        permId: PermissionId.TestimonialAdd
                    },
                    {path: PagePaths.themeContent().post(PostTypeId.Testimonial).list(), title: "list"}
                ]
            },
        ]
    },
    {
        path: PagePaths.component().self(),
        icon: `shape`,
        title: "components",
        state: `components`,
        subPaths: [
            {
                path: PagePaths.component().add(),
                title: "add",
                roleId: UserRoleId.SuperAdmin,
            },
            {path: PagePaths.component().list(), title: "list"}
        ]
    },
    {
        path: PagePaths.settings().self(),
        icon: `cog`,
        title: "settings",
        state: `settings`,
        subPaths: [
            {
                path: PagePaths.settings().user().self(),
                icon: `account-multiple`,
                title: "users",
                state: `users`,
                subPaths: [
                    {
                        path: PagePaths.settings().user().add(),
                        title: "add",
                        permId: PermissionId.UserAdd
                    },
                    {path: PagePaths.settings().user().list(), title: "list"}
                ]
            },
            {
                path: PagePaths.settings().seo(),
                icon: `magnify`,
                title: "seo",
                permId: PermissionId.SeoEdit
            },
            {
                path: PagePaths.settings().general(),
                title: "general",
                permId: PermissionId.SettingEdit
            },
            {
                path: PagePaths.settings().subscribers(),
                title: "subscribers",
                permId: PermissionId.SubscriberEdit
            },
            {
                path: PagePaths.settings().contactForms(),
                title: "contactForms",
                roleId: UserRoleId.Admin,
            },
            {
                path: PagePaths.settings().staticLanguages(),
                title: "staticLanguages",
                permId: PermissionId.StaticLanguage
            },
        ]
    },
];

export default SidebarNav;