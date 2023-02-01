import {PostTypeId} from "./postTypes";
import {PostTermTypeId} from "./postTermTypes";
import pagePathLib from "lib/pagePath.lib";

const PagePaths = {
    login() {
        return pagePathLib.setPath("login");
    },
    lock() {
        return pagePathLib.setPath("lock");
    },
    dashboard() {
        return pagePathLib.setPath("dashboard");
    },
    gallery() {
        let path = pagePathLib.setPath("gallery");

        return {
            self() {
                return pagePathLib.setPath(path);
            },
            upload() {
                return pagePathLib.setPath(path, "upload");
            },
            list() {
                return pagePathLib.setPath(path, "list");
            }
        }
    },
    component() {
        let path = pagePathLib.setPath("component");

        return {
            self() {
                return pagePathLib.setPath(path);
            },
            add() {
                return pagePathLib.setPath(path, "add");
            },
            edit(_id: string | number | undefined = ":_id") {
                return pagePathLib.setPath(path, "edit", _id);
            },
            list() {
                return pagePathLib.setPath(path, "list");
            }
        }
    },
    navigation() {
        let path = pagePathLib.setPath("navigation");

        return {
            self() {
                return pagePathLib.setPath(path);
            },
            add() {
                return pagePathLib.setPath(path, "add");
            },
            edit(_id: string | number | undefined = ":_id") {
                return pagePathLib.setPath(path, "edit", _id);
            },
            list() {
                return pagePathLib.setPath(path, "list");
            }
        }
    },
    post(typeId: string | PostTypeId = ":postTypeId", firstPath: string | undefined = undefined) {
        let path = pagePathLib.setPath(firstPath, "post", typeId);

        return {
            self() {
                return pagePathLib.setPath(path);
            },
            add() {
                return pagePathLib.setPath(path, "add");
            },
            edit(_id: string | number | undefined = ":_id") {
                return pagePathLib.setPath(path, "edit", _id);
            },
            list() {
                return pagePathLib.setPath(path, "list");
            },
            term(typeId: string | PostTermTypeId | undefined = ":termTypeId") {
                path = pagePathLib.setPath(path, "term", typeId);

                return {
                    self() {
                        return pagePathLib.setPath(path);
                    },
                    add() {
                        return pagePathLib.setPath(path, "add");
                    },
                    edit(_id: string | number | undefined = ":_id") {
                        return pagePathLib.setPath(path, "edit", _id);
                    },
                    list() {
                        return pagePathLib.setPath(path, "list");
                    },
                }
            }
        }
    },
    themeContent() {
        let path = pagePathLib.setPath("theme-content");

        return {
            self() {
                return pagePathLib.setPath(path);
            },
            post(typeId?: number) {
                return PagePaths.post(typeId, path);
            }
        }
    },
    eCommerce() {
        let path = pagePathLib.setPath("e-commerce");

        return {
            self() {
                return pagePathLib.setPath(path);
            },
            product() {
                return PagePaths.post(PostTypeId.Product, pagePathLib.setPath(path, "product"));
            },
            settings() {
                return pagePathLib.setPath(path, "settings");
            }
        }
    },
    settings() {
        let path = pagePathLib.setPath("settings");

        return {
            self() {
                return pagePathLib.setPath(path);
            },
            seo() {
                return pagePathLib.setPath(path, "seo");
            },
            general() {
                return pagePathLib.setPath(path, "general");
            },
            profile() {
                return pagePathLib.setPath(path, "profile");
            },
            changePassword() {
                return pagePathLib.setPath(path, "change-password");
            },
            staticLanguages() {
                return pagePathLib.setPath(path, "static-languages");
            },
            subscribers() {
                return pagePathLib.setPath(path, "subscribers");
            },
            contactForms() {
                return pagePathLib.setPath(path, "contact-forms");
            },
            socialMedia() {
                return pagePathLib.setPath(path, "social-media");
            },
            user() {
                path = pagePathLib.setPath(path, "user");

                return {
                    self() {
                        return pagePathLib.setPath(path);
                    },
                    add() {
                        return pagePathLib.setPath(path, "add");
                    },
                    edit(_id: string | number | undefined = ":_id") {
                        return pagePathLib.setPath(path, "edit", _id);
                    },
                    list() {
                        return pagePathLib.setPath(path, "list");
                    },
                }
            },
            language() {
                path = pagePathLib.setPath(path, "language");

                return {
                    self() {
                        return pagePathLib.setPath(path);
                    },
                    add() {
                        return pagePathLib.setPath(path, "add");
                    },
                    edit(_id: string | number | undefined = ":_id") {
                        return pagePathLib.setPath(path, "edit", _id);
                    },
                    list() {
                        return pagePathLib.setPath(path, "list");
                    },
                }
            }
        }
    }
}

export default PagePaths;