import {PostTypeId} from "constants/postTypes";
import PagePaths from "constants/pagePaths";

export default {
    getPagePath(postTypeId: PostTypeId) {
        postTypeId = Number(postTypeId);
        let pagePath = PagePaths.themeContent().post(postTypeId);

        if([PostTypeId.Page, PostTypeId.Navigate].includes(postTypeId)){
            pagePath = PagePaths.post(postTypeId);
        }

        if([PostTypeId.Product, PostTypeId.ProductVariation].includes(postTypeId)){
            pagePath = PagePaths.eCommerce().post(postTypeId);
        }

        return pagePath;
    }
}