import {PostTypeId} from "./postTypes";
import {PostTermTypeId} from "./postTermTypes";

function setPath(...paths: (number | string | undefined)[]) {
    let returnPath = "";
    for (let path of paths) {
        if (path) {
            if (
                typeof path === "string" &&
                path.length > 0 &&
                path.startsWith("/")
            ) {
                path = path.slice(1);
            }

            returnPath += `/${path}`;
        }
    }
    return returnPath;
}

const PagePaths = {
    login() {
        return setPath("login");
    },
    lock() {
        return setPath("lock");
    },
    dashboard() {
        return setPath("dashboard");
    },
    gallery() {
        let path = setPath("gallery");

        return {
            self() {
                return setPath(path);
            },
            upload() {
                return setPath(path, "upload");
            },
            list() {
                return setPath(path, "list");
            }
        }
    },
    component() {
        let path = setPath("component");

        return {
            self() {
                return setPath(path);
            },
            add() {
                return setPath(path, "add");
            },
            edit(_id: string | number | undefined = ":componentId") {
                return setPath(path, "edit", _id);
            },
            list() {
                return setPath(path, "list");
            }
        }
    },
    post(typeId: string | PostTypeId = ":postTypeId", firstPath: string | undefined = undefined) {
        let path = setPath(firstPath, "post", typeId);

        return {
            self() {
                return setPath(path);
            },
            add() {
                return setPath(path, "add");
            },
            edit(_id: string | number | undefined = ":postId") {
                return setPath(path, "edit", _id);
            },
            list() {
                return setPath(path, "list");
            },
            term(typeId: string | PostTermTypeId | undefined = ":termTypeId") {
                path = setPath(path, "term", typeId);

                return {
                    self() {
                        return setPath(path);
                    },
                    add() {
                        return setPath(path, "add");
                    },
                    edit(_id: string | number | undefined = ":termId") {
                        return setPath(path, "edit", _id);
                    },
                    list() {
                        return setPath(path, "list");
                    },
                }
            }
        }
    },
    themeContent() {
        let path = setPath("themeContent");

        return {
            self() {
                return setPath(path);
            },
            post(typeId?: number) {
                return PagePaths.post(typeId, path);
            }
        }
    },
    settings() {
        let path = setPath("settings");

        return {
            self() {
                return setPath(path);
            },
            seo() {
                return setPath(path, "seo");
            },
            general() {
                return setPath(path, "general");
            },
            profile() {
                return setPath(path, "profile");
            },
            changePassword() {
                return setPath(path, "changePassword");
            },
            staticLanguages() {
                return setPath(path, "staticLanguages");
            },
            subscribers() {
                return setPath(path, "subscribers");
            },
            contactForms() {
                return setPath(path, "contactForms");
            },
            user() {
                path = setPath(path, "user");

                return {
                    self() {
                        return setPath(path);
                    },
                    add() {
                        return setPath(path, "add");
                    },
                    edit(_id: string | number | undefined = ":userId") {
                        return setPath(path, "edit", _id);
                    },
                    list() {
                        return setPath(path, "list");
                    },
                }
            }
        }
    }
}

export default PagePaths;