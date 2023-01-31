import {PermissionPathDocument} from "types/constants/permissionPaths";
import galleryPermissionPath from "./gallery.permissionPath";
import componentPermissionPath from "./component.permissionPath";
import settingPermissionPath from "./setting.permissionPath";
import postPermissionPath from "./post.permissionPath";
import postTermPermissionPath from "./postTerm.permissionPath";
import navigationPermissionPath from "./navigation.permissionPath";
import eCommercePermissionPath from "./eCommerce.permissionPath";

const PermissionPaths: PermissionPathDocument[] = [
    ...galleryPermissionPath,
    ...componentPermissionPath,
    ...settingPermissionPath,
    ...postPermissionPath,
    ...postTermPermissionPath,
    ...navigationPermissionPath,
    ...eCommercePermissionPath
];

export default PermissionPaths;