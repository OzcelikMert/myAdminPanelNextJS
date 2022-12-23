import PagePaths from "../pagePaths";
import {PermissionId} from "../permissions";
import {PermissionPathDocument} from "types/constants/permissionPaths";
import {PostTypeId} from "../postTypes";

export default [
    {
        path: PagePaths.post(PostTypeId.Page).term(undefined).self(),
        permissionId: PermissionId.PageAdd
    },
    {
        path: PagePaths.themeContent().post(PostTypeId.Slider).term(undefined).self(),
        permissionId: PermissionId.SliderAdd
    },
    {
        path: PagePaths.themeContent().post(PostTypeId.Navigate).term(undefined).self(),
        permissionId: PermissionId.NavigateAdd
    },
    {
        path: PagePaths.themeContent().post(PostTypeId.Service).term(undefined).self(),
        permissionId: PermissionId.ServiceAdd
    },
    {
        path: PagePaths.themeContent().post(PostTypeId.Blog).term(undefined).self(),
        permissionId: PermissionId.BlogAdd
    },
    {
        path: PagePaths.themeContent().post(PostTypeId.Portfolio).term(undefined).self(),
        permissionId: PermissionId.PortfolioAdd
    },
    {
        path: PagePaths.themeContent().post(PostTypeId.Reference).term(undefined).self(),
        permissionId: PermissionId.ReferenceAdd
    },
    {
        path: PagePaths.themeContent().post(PostTypeId.Testimonial).term(undefined).self(),
        permissionId: PermissionId.TestimonialAdd
    }
] as PermissionPathDocument[]