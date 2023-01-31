import {PostTypeId} from "constants/postTypes";
import PagePaths from "constants/pagePaths";

export default {
    getPagePath(postTypeId: PostTypeId) {
        postTypeId = Number(postTypeId);
        let pagePath = PagePaths.themeContent().post(postTypeId);

        if([PostTypeId.Page].includes(postTypeId)){
            pagePath = PagePaths.post(postTypeId);
        }

        if([PostTypeId.Product].includes(postTypeId)){
            pagePath = PagePaths.eCommerce().product();
        }

        return pagePath;
    }
}