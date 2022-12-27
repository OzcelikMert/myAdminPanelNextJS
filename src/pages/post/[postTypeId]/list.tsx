import React, {Component} from 'react'
import {PageTypeId, PageTypes, PostTermTypeId, PostTypeId, PostTypes, Status, StatusId} from "constants/index";
import {PagePropCommonDocument} from "types/pageProps";
import {TableColumn} from "react-data-table-component";
import {ThemeTableToggleMenu} from "components/elements/table";
import Swal from "sweetalert2";
import postService from "services/post.service";
import PostDocument from "types/services/post";
import imageSourceLib from "lib/imageSource.lib";
import classNameLib from "lib/className.lib";
import permissionLib from "lib/permission.lib";
import ThemeToast from "components/elements/toast";
import PagePaths from "constants/pagePaths";
import ThemeDataTable from "components/elements/table/dataTable";

type PageState = {
    typeId: PostTypeId
    searchKey: string
    posts: PostDocument[],
    showingPosts: PageState["posts"]
    selectedPosts: PageState["posts"]
    listMode: "list" | "deleted"
    isShowToggleMenu: boolean
};

type PageProps = {} & PagePropCommonDocument;

export default class PagePostList extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            typeId: Number(this.props.router.query.postTypeId ?? 1),
            searchKey: "",
            selectedPosts: [],
            listMode: "list",
            isShowToggleMenu: false,
            posts: [],
            showingPosts: [],
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getPosts();
        this.props.setStateApp({
            isPageLoading: false
        })
    }

    async componentDidUpdate(prevProps: Readonly<PageProps>) {
        let typeId = Number(this.props.router.query.postTypeId ?? 1);
        if (typeId !== this.state.typeId) {
            this.setState({
                typeId: typeId
            }, async () => {
                await this.getPosts();
                this.props.setStateApp({
                    isPageLoading: false
                })
            })

        }
    }

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t(PostTypes.findSingle("id", this.state.typeId)?.langKey ?? "[noLangAdd]"),
            this.props.t("list")
        ])
    }

    async getPosts() {
        let posts = (await postService.get({
            typeId: this.state.typeId,
            langId: this.props.getStateApp.pageData.langId
        })).data;
        this.setState((state: PageState) => {
            state.posts = posts;
            state.showingPosts = posts.filter(value => value.statusId !== StatusId.Deleted);
            return state;
        });
    }

    onChangeStatus = (event: any, statusId: number) => {
        event.preventDefault();
        let selectedPostId = this.state.selectedPosts.map(post => post._id);
        if (statusId === StatusId.Deleted && this.state.listMode === "deleted") {
            Swal.fire({
                title: this.props.t("deleteAction"),
                text: this.props.t("deleteSelectedItemsQuestion"),
                confirmButtonText: this.props.t("yes"),
                cancelButtonText: this.props.t("no"),
                icon: "question",
                showCancelButton: true
            }).then(result => {
                if (result.isConfirmed) {
                    const loadingToast = new ThemeToast({
                        content: this.props.t("deleting"),
                        type: "loading"
                    });

                    postService.delete({
                        postId: selectedPostId,
                        typeId: this.state.typeId
                    }).then(resData => {
                        loadingToast.hide();
                        if (resData.status) {
                            this.setState((state: PageState) => {
                                state.posts = state.posts.filter(item => !selectedPostId.includes(item._id));
                                return state;
                            }, () => {
                                new ThemeToast({
                                    type: "success",
                                    title: this.props.t("successful"),
                                    content: this.props.t("itemDeleted")
                                })
                                this.onChangeListMode(this.state.listMode);
                            })
                        }
                    })
                }
            })
        } else {
            const loadingToast = new ThemeToast({
                content: this.props.t("updating"),
                type: "loading"
            });
            postService.updateStatus({
                postId: selectedPostId,
                typeId: this.state.typeId,
                statusId: statusId
            }).then(resData => {
                loadingToast.hide();
                if (resData.status) {
                    this.setState((state: PageState) => {
                        state.posts.map((item, index) => {
                            if (selectedPostId.includes(item._id)) {
                                item.statusId = statusId;
                            }
                        })
                        return state;
                    }, () => {
                        new ThemeToast({
                            type: "success",
                            title: this.props.t("successful"),
                            content: this.props.t("statusUpdated")
                        })
                        this.onChangeListMode(this.state.listMode);
                    })
                }
            })
        }
    }

    onSelect(selectedRows: PageState["showingPosts"]) {
        this.setState((state: PageState) => {
            state.selectedPosts = selectedRows;
            state.isShowToggleMenu = selectedRows.length > 0;
            return state;
        })
    }

    onSearch(searchKey: string) {
        this.setState({
            searchKey: searchKey,
            showingPosts: this.state.showingPosts.filter(post => (post.contents?.title ?? "").toLowerCase().search(searchKey) > -1)
        })
    }

    onChangeListMode(mode: PageState["listMode"]) {
        this.setState((state: PageState) => {
            state.listMode = mode;
            state.showingPosts = [];
            state.selectedPosts = [];
            state.isShowToggleMenu = false;
            if (mode === "list") {
                state.showingPosts = state.posts.findMulti("statusId", StatusId.Deleted, false);
            } else {
                state.showingPosts = state.posts.findMulti("statusId", StatusId.Deleted);
            }
            return state;
        }, () => this.onSearch(this.state.searchKey))
    }

    navigateTermPage(type: "termEdit" | "edit", itemId = "", termTypeId = 0) {
        let postTypeId = this.state.typeId;
        let pagePath = [PostTypeId.Page, PostTypeId.Navigate].includes(Number(postTypeId)) ? PagePaths.post(postTypeId) : PagePaths.themeContent().post(postTypeId);
        let path = (type === "edit")
            ? pagePath.edit(itemId)
            : (type === "termEdit" && itemId)
                ? pagePath.term(termTypeId).edit(itemId)
                : pagePath.term(termTypeId).list()
        this.props.router.push(path);
    }

    get getTableColumns(): TableColumn<PageState["showingPosts"][0]>[] {
        return [
            (
                ![PostTypeId.Navigate].includes(this.state.typeId)
                    ? {
                        name: this.props.t("image"),
                        width: "75px",
                        cell: row => {
                            return <div className="image pt-2 pb-2">
                                <img
                                    src={imageSourceLib.getUploadedImageSrc(row.contents?.image)}
                                    alt={row.contents?.title}
                                    className="post-image"
                                />
                            </div>
                        }
                    } : {}
            ),
            {
                name: this.props.t("title"),
                selector: row => row.contents?.title || this.props.t("[noLangAdd]"),
                cell: row => (
                    <div className="row w-100">
                        <div className="col-md-8">{row.contents?.title || this.props.t("[noLangAdd]")}</div>
                        <div className="col-md-4">
                            {
                                row.isFixed
                                    ? <i className="mdi mdi-pin text-success fs-5"></i>
                                    : null
                            }
                        </div>
                    </div>
                ),
                width: "250px",
                sortable: true
            },
            (
                [PostTypeId.Navigate].includes(this.state.typeId)
                    ? {
                        name: this.props.t("main"),
                        selector: row => row.mainId ? row.mainId.contents?.title || this.props.t("[noLangAdd]") : this.props.t("notSelected"),
                        sortable: true
                    } : {}
            ),
            (
                ![PostTypeId.Slider, PostTypeId.Page, PostTypeId.Service, PostTypeId.Testimonial, PostTypeId.Navigate].includes(this.state.typeId)
                    ? {
                        name: this.props.t("category"),
                        cell: row => row.terms.findMulti("typeId", PostTermTypeId.Category).length > 0
                            ? row.terms.map(item => {
                                    if(typeof item === "undefined"){
                                        return <label
                                            className={`badge badge-gradient-danger me-1`}
                                        >{this.props.t("deleted")}</label>
                                    } else if (item.typeId == PostTermTypeId.Category) {
                                        return <label
                                            onClick={() => this.navigateTermPage("termEdit", item._id, row.typeId)}
                                            className={`badge badge-gradient-success me-1 cursor-pointer`}
                                        >{item.contents?.title || this.props.t("[noLangAdd]")}</label>
                                    }
                                    return null;
                                }
                            ) : this.props.t("notSelected")

                    } : {}
            ),
            (
                [PostTypeId.Page, PostTypeId.Blog, PostTypeId.Portfolio, PostTypeId.Service].includes(this.state.typeId)
                    ? {
                        name: this.props.t("views"),
                        selector: row => row.views,
                        sortable: true
                    } : {}
            ),
            (
                [PostTypeId.Page].includes(this.state.typeId)
                    ? {
                        name: this.props.t("pageType"),
                        selector: row => this.props.t(PageTypes.findSingle("id", (row.pageTypeId ? row.pageTypeId : PageTypeId.Default))?.langKey ?? "[noLangAdd]"),
                        sortable: true,
                        cell: row => (
                            <label className={`badge badge-gradient-dark`}>
                                {
                                    this.props.t(PageTypes.findSingle("id", (row.pageTypeId ? row.pageTypeId : PageTypeId.Default))?.langKey ?? "[noLangAdd]")
                                }
                            </label>
                        )
                    } : {}
            ),
            {
                name: this.props.t("status"),
                sortable: true,
                cell: row => (
                    <label className={`badge badge-gradient-${classNameLib.getStatusClassName(row.statusId)}`}>
                        {
                            this.props.t(Status.findSingle("id", row.statusId)?.langKey ?? "[noLangAdd]")
                        }
                    </label>
                )
            },
            {
                name: this.props.t("updatedBy"),
                sortable: true,
                selector: row => row.lastAuthorId.name
            },
            {
                name: "",
                width: "70px",
                button: true,
                cell: row => permissionLib.checkPermission(
                    this.props.getStateApp.sessionData.roleId,
                    this.props.getStateApp.sessionData.permissions,
                    permissionLib.getPermissionIdForPostType(row.typeId, "Edit")
                ) ? (
                    <button
                        onClick={() => this.navigateTermPage("edit", row._id)}
                        className="btn btn-gradient-warning"
                    ><i className="fa fa-pencil-square-o"></i></button>
                ) : null
            }
        ];
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-post">
                <div className="row mb-3">
                    <div className="col-md-3">
                        <div className="row">
                            {
                                ![PostTypeId.Slider, PostTypeId.Page, PostTypeId.Service, PostTypeId.Testimonial, PostTypeId.Navigate, PostTypeId.Reference].includes(this.state.typeId)
                                    ? <div className="col-6">
                                        <button className="btn btn-gradient-info btn-lg w-100"
                                                onClick={() => this.navigateTermPage("termEdit", "", PostTermTypeId.Category)}>
                                            <i className="fa fa-pencil-square-o"></i> {this.props.t("editCategories").toCapitalizeCase()}
                                        </button>
                                    </div> : null
                            }
                            {
                                ![PostTypeId.Slider, PostTypeId.Service, PostTypeId.Testimonial, PostTypeId.Navigate, PostTypeId.Reference].includes(this.state.typeId)
                                    ? <div className="col-6 text-end">
                                        <button className="btn btn-gradient-primary btn-edit-tag btn-lg w-100"
                                                onClick={() => this.navigateTermPage("termEdit", "", PostTermTypeId.Tag)}>
                                            <i className="fa fa-pencil-square-o"></i> {this.props.t("editTags").toCapitalizeCase()}
                                        </button>
                                    </div> : null
                            }
                        </div>
                    </div>
                    <div className="col-md-9 text-end">
                        {
                            this.state.listMode === "list"
                                ? <button className="btn btn-gradient-danger btn-lg list-mode-btn"
                                          onClick={() => this.onChangeListMode("deleted")}>
                                    <i className="mdi mdi-delete"></i> {this.props.t("trash")} ({this.state.posts.findMulti("statusId", StatusId.Deleted).length})
                                </button>
                                : <button className="btn btn-gradient-success btn-lg list-mode-btn"
                                          onClick={() => this.onChangeListMode("list")}>
                                    <i className="mdi mdi-view-list"></i> {this.props.t("list")} ({this.state.posts.findMulti("statusId", StatusId.Deleted, false).length})
                                </button>
                        }
                    </div>
                </div>
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="table-post">
                                <div className={`ms-2 ${!this.state.isShowToggleMenu ? "invisible" : ""}`}>
                                    {
                                        (
                                            permissionLib.checkPermission(
                                                this.props.getStateApp.sessionData.roleId,
                                                this.props.getStateApp.sessionData.permissions,
                                                permissionLib.getPermissionIdForPostType(this.state.typeId, "Edit")
                                            ) ||
                                            permissionLib.checkPermission(
                                                this.props.getStateApp.sessionData.roleId,
                                                this.props.getStateApp.sessionData.permissions,
                                                permissionLib.getPermissionIdForPostType(this.state.typeId, "Delete")
                                            )
                                        ) ? <ThemeTableToggleMenu
                                            t={this.props.t}
                                            status={
                                                [
                                                    StatusId.Active,
                                                    StatusId.Pending,
                                                    StatusId.InProgress
                                                ].concat(
                                                    permissionLib.checkPermission(
                                                        this.props.getStateApp.sessionData.roleId,
                                                        this.props.getStateApp.sessionData.permissions,
                                                        permissionLib.getPermissionIdForPostType(this.state.typeId, "Delete")
                                                    ) ? [StatusId.Deleted] : []
                                                )
                                            }
                                            onChange={(event, statusId) => this.onChangeStatus(event, statusId)}
                                            langId={this.props.getStateApp.sessionData.langId}
                                        /> : null
                                    }
                                </div>
                                <ThemeDataTable
                                    columns={this.getTableColumns.filter(column => typeof column.name !== "undefined")}
                                    data={this.state.showingPosts}
                                    onSelect={rows => this.onSelect(rows)}
                                    onSearch={searchKey => this.onSearch(searchKey)}
                                    selectedRows={this.state.selectedPosts}
                                    t={this.props.t}
                                    isSelectable={true}
                                    isAllSelectable={true}
                                    isSearchable={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
