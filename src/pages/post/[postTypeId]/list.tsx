import React, {Component} from 'react'
import {PageTypeId, PageTypes, PostTermTypeId, PostTypeId, Status, StatusId} from "constants/index";
import {PagePropCommonDocument} from "types/pageProps";
import {TableColumn} from "react-data-table-component";
import ThemeTableToggleMenu, {ThemeToggleMenuItemDocument} from "components/theme/table/toggleMenu";
import Swal from "sweetalert2";
import postService from "services/post.service";
import PostDocument from "types/services/post";
import imageSourceLib from "lib/imageSource.lib";
import classNameLib from "lib/className.lib";
import permissionLib from "lib/permission.lib";
import ThemeToast from "components/theme/toast";
import ThemeDataTable from "components/theme/table/dataTable";
import Image from "next/image"
import PostLib from "lib/post.lib";
import postLib from "lib/post.lib";
import ThemeBadgeStatus from "components/theme/badge/status";
import ThemeTableUpdatedBy from "components/theme/table/updatedBy";

type PageState = {
    typeId: PostTypeId
    searchKey: string
    items: PostDocument[],
    showingItems: PageState["items"]
    selectedItems: PageState["items"]
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
            selectedItems: [],
            listMode: "list",
            isShowToggleMenu: false,
            items: [],
            showingItems: [],
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getItems();
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
                await this.getItems();
                this.props.setStateApp({
                    isPageLoading: false
                })
            })

        }

        if (prevProps.getStateApp.pageData.langId != this.props.getStateApp.pageData.langId) {
            this.props.setStateApp({
                isPageLoading: true
            }, async () => {
                await this.getItems()
                this.props.setStateApp({
                    isPageLoading: false
                })
            })
        }
    }

    setPageTitle() {
        let titles: string[] = [
            ...postLib.getPageTitles({t: this.props.t, postTypeId: this.state.typeId}),
            this.props.t("list")
        ];
        this.props.setBreadCrumb(titles);
    }

    async getItems() {
        let items = (await postService.get({
            typeId: this.state.typeId,
            langId: this.props.getStateApp.pageData.langId,
            ignoreDefaultLanguage: true
        })).data;
        this.setState((state: PageState) => {
            state.items = items;
            state.showingItems = items.filter(item => item.statusId !== StatusId.Deleted);
            return state;
        });
    }

    onChangeStatus = async (statusId: number) => {
        let selectedItemId = this.state.selectedItems.map(item => item._id);
        if (statusId === StatusId.Deleted && this.state.listMode === "deleted") {
            let result = await Swal.fire({
                title: this.props.t("deleteAction"),
                text: this.props.t("deleteSelectedItemsQuestion"),
                confirmButtonText: this.props.t("yes"),
                cancelButtonText: this.props.t("no"),
                icon: "question",
                showCancelButton: true
            });
            if (result.isConfirmed) {
                const loadingToast = new ThemeToast({
                    content: this.props.t("deleting"),
                    type: "loading"
                });

                let resData = await postService.delete({_id: selectedItemId, typeId: this.state.typeId})
                loadingToast.hide();
                if (resData.status) {
                    this.setState((state: PageState) => {
                        state.items = state.items.filter(item => !selectedItemId.includes(item._id));
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
            }
        } else {
            const loadingToast = new ThemeToast({
                content: this.props.t("updating"),
                type: "loading"
            });

            let resData = await postService.updateStatus({
                _id: selectedItemId,
                typeId: this.state.typeId,
                statusId: statusId
            })
            loadingToast.hide();
            if (resData.status) {
                this.setState((state: PageState) => {
                    state.items.map((item, index) => {
                        if (selectedItemId.includes(item._id)) {
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
        }
    }

    onSelect(selectedRows: PageState["showingItems"]) {
        this.setState((state: PageState) => {
            state.selectedItems = selectedRows;
            state.isShowToggleMenu = selectedRows.length > 0;
            return state;
        })
    }

    onSearch(searchKey: string) {
        this.setState({
            searchKey: searchKey,
            showingItems: this.state.showingItems.filter(item => (item.contents?.title ?? "").toLowerCase().search(searchKey) > -1)
        })
    }

    onChangeListMode(mode: PageState["listMode"]) {
        this.setState((state: PageState) => {
            state.listMode = mode;
            state.showingItems = [];
            state.selectedItems = [];
            state.isShowToggleMenu = false;
            if (mode === "list") {
                state.showingItems = state.items.findMulti("statusId", StatusId.Deleted, false);
            } else {
                state.showingItems = state.items.findMulti("statusId", StatusId.Deleted);
            }
            return state;
        }, () => this.onSearch(this.state.searchKey))
    }

    navigatePage(type: "termEdit" | "edit" | "termList", itemId = "", termTypeId = 0) {
        let postTypeId = this.state.typeId;
        let pagePath = PostLib.getPagePath(postTypeId);
        let path = "";
        switch (type) {
            case "edit":
                path = pagePath.edit(itemId);
                break;
            case "termEdit":
                path = pagePath.term(termTypeId).edit(itemId);
                break;
            case "termList":
                path = pagePath.term(termTypeId).list();
                break;
        }
        this.props.router.push(path);
    }

    get getToggleMenuItems(): ThemeToggleMenuItemDocument[] {
        return Status.findMulti("id", [
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
        ).map(item => ({label: this.props.t(item.langKey), value: item.id, icon: classNameLib.getStatusIcon(item.id)}))
    }

    get getTableColumns(): TableColumn<PageState["showingItems"][0]>[] {
        return [
            {
                name: this.state.isShowToggleMenu ? (
                    <ThemeTableToggleMenu
                        items={this.getToggleMenuItems}
                        onChange={(value) => this.onChangeStatus(value)}
                    />
                ) : this.props.t("image"),
                width: "105px",
                cell: row => {
                    return Boolean(row.contents && row.contents.icon && row.contents.icon.length > 0)
                        ? <small>{row.contents?.icon}</small>
                        : <div className="image pt-2 pb-2">
                            <Image
                                src={imageSourceLib.getUploadedImageSrc(row.contents?.image)}
                                alt={row.contents?.title ?? ""}
                                className="post-image img-fluid"
                                width={75}
                                height={75}
                            />
                        </div>
                }
            },
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
                [PostTypeId.Blog, PostTypeId.Portfolio, PostTypeId.Product, PostTypeId.BeforeAndAfter].includes(this.state.typeId)
                    ? {
                        name: this.props.t("category"),
                        cell: row => row.terms.findMulti("typeId", PostTermTypeId.Category).length > 0
                            ? row.terms.map(item => {
                                    if (typeof item === "undefined") {
                                        return <label
                                            className={`badge badge-gradient-danger me-1`}
                                        >{this.props.t("deleted")}</label>
                                    } else if (item.typeId == PostTermTypeId.Category) {
                                        return <label
                                            onClick={() => this.navigatePage("termEdit", item._id, row.typeId)}
                                            className={`badge badge-gradient-success me-1 cursor-pointer`}
                                        >{item.contents?.title || this.props.t("[noLangAdd]")}</label>
                                    }
                                    return null;
                                }
                            ) : this.props.t("notSelected")

                    } : {}
            ),
            (
                [PostTypeId.Page, PostTypeId.Blog, PostTypeId.Portfolio, PostTypeId.Service, PostTypeId.BeforeAndAfter].includes(this.state.typeId)
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
                cell: row => <ThemeBadgeStatus t={this.props.t} statusId={row.statusId} />
            },
            {
                name: this.props.t("updatedBy"),
                sortable: true,
                cell: row => <ThemeTableUpdatedBy name={row.lastAuthorId.name} updatedAt={row.updatedAt} />
            },
            {
                name: this.props.t("order"),
                sortable: true,
                selector: row => row.order
            },
            {
                name: this.props.t("createdDate"),
                sortable: true,
                selector: row => new Date(row.createdAt).toLocaleDateString(),
                sortFunction: (a, b) => ThemeDataTable.dateSort(a, b)
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
                        onClick={() => this.navigatePage("edit", row._id)}
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
                    <div className="col-md-8">
                        <div className="row">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="row">
                                    {
                                        ![PostTypeId.Slider, PostTypeId.Page, PostTypeId.Service, PostTypeId.Testimonial, PostTypeId.Reference].includes(this.state.typeId)
                                            ? <div className="col-6">
                                                <button className="btn btn-gradient-success btn-lg w-100"
                                                        onClick={() => this.navigatePage("termList", "", PostTermTypeId.Category)}>
                                                    <i className="fa fa-pencil-square-o"></i> {this.props.t("editCategories").toCapitalizeCase()}
                                                </button>
                                            </div> : null
                                    }
                                    {
                                        ![PostTypeId.Slider, PostTypeId.Service, PostTypeId.Testimonial, PostTypeId.Reference].includes(this.state.typeId)
                                            ? <div className="col-6">
                                                <button className="btn btn-gradient-info btn-edit-tag btn-lg w-100"
                                                        onClick={() => this.navigatePage("termList", "", PostTermTypeId.Tag)}>
                                                    <i className="fa fa-pencil-square-o"></i> {this.props.t("editTags").toCapitalizeCase()}
                                                </button>
                                            </div> : null
                                    }
                                </div>
                            </div>
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="row">
                                    {
                                        [PostTypeId.Product].includes(this.state.typeId)
                                            ? <div className="col-6">
                                                <button className="btn btn-gradient-primary btn-edit-tag btn-lg w-100"
                                                        onClick={() => this.navigatePage("termList", "", PostTermTypeId.Attributes)}>
                                                    <i className="fa fa-pencil-square-o"></i> {this.props.t("editAttribute").toCapitalizeCase()}
                                                </button>
                                            </div> : null
                                    }
                                    {
                                        [PostTypeId.Product].includes(this.state.typeId)
                                            ? <div className="col-6">
                                                <button className="btn btn-gradient-warning btn-edit-tag btn-lg w-100"
                                                        onClick={() => this.navigatePage("termList", "", PostTermTypeId.Variations)}>
                                                    <i className="fa fa-pencil-square-o"></i> {this.props.t("editVariation").toCapitalizeCase()}
                                                </button>
                                            </div> : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 text-end">
                        {
                            this.state.listMode === "list"
                                ? <button className="btn btn-gradient-danger btn-lg list-mode-btn"
                                          onClick={() => this.onChangeListMode("deleted")}>
                                    <i className="mdi mdi-delete"></i> {this.props.t("trash")} ({this.state.items.findMulti("statusId", StatusId.Deleted).length})
                                </button>
                                : <button className="btn btn-gradient-success btn-lg list-mode-btn"
                                          onClick={() => this.onChangeListMode("list")}>
                                    <i className="mdi mdi-view-list"></i> {this.props.t("list")} ({this.state.items.findMulti("statusId", StatusId.Deleted, false).length})
                                </button>
                        }
                    </div>
                </div>
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="table-post">
                                <ThemeDataTable
                                    columns={this.getTableColumns.filter(column => typeof column.name !== "undefined")}
                                    data={this.state.showingItems}
                                    onSelect={rows => this.onSelect(rows)}
                                    onSearch={searchKey => this.onSearch(searchKey)}
                                    selectedRows={this.state.selectedItems}
                                    t={this.props.t}
                                    isSelectable={(
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
                                    )}
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
