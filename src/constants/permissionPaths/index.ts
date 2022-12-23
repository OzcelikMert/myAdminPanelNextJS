import {PermissionPathDocument} from "types/constants/permissionPaths";
import galleryPermissionPath from "./gallery.permissionPath";
import componentPermissionPath from "./component.permissionPath";
import settingPermissionPath from "./setting.permissionPath";
import postPermissionPath from "./post.permissionPath";
import postTermPermissionPath from "./postTerm.permissionPath";

const PermissionPaths: PermissionPathDocument[] = [
    ...galleryPermissionPath,
    ...componentPermissionPath,
    ...settingPermissionPath,
    ...postPermissionPath,
    ...postTermPermissionPath
];

export default PermissionPaths;