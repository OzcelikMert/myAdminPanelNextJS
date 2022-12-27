import V from "library/variable";
import {emptyImage} from "components/elements/chooseImage";
import pathUtil from "utils/path.util";

export default {
    getUploadedImageSrc(imageName?: string): any {
        return imageName && !V.isEmpty(imageName)
            ? (imageName.isUrl())
                ? imageName
                : pathUtil.uploads.images + imageName
            : emptyImage
    },
}