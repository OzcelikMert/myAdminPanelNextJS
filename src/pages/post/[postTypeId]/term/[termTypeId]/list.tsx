import React, {Component} from 'react'
import {
    PostTermTypeId,
    PostTermTypes, PostTypeId,
    PostTypes, Status,
    StatusId
} from "constants/index";
import {PagePropCommonDocument} from "types/pageProps";
import {TableColumn} from "react-data-table-component";
import {ThemeTableToggleMenu} from "components/elements/table";
import Swal from "sweetalert2";
import PostTermDocument from "types/services/postTerm";
import postTermService from "services/postTerm.service";
import imageSourceLib from "lib/imageSource.lib";
import classNameLib from "lib/className.lib";
import permissionLib from "lib/permission.lib";
import ThemeToast from "components/elements/toast";
import PagePaths from "constants/pagePaths";
import ThemeDataTable from "components/elements/table/dataTable";

type PageState = {
    typeId: PostTermTypeId
    postTypeId: PostTypeId
    searchKey: string
    postTerms: PostTermDocument[],
    showingPostTerms: PageState["postTerms"]
    selectedPostTerms: PageState["postTerms"]
    listMode: "list" | "deleted"
    isShowToggleMenu: boolean
};

type PageProps = {} & PagePropCommonDocument;

export default class PagePostTermList extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            typeId: Number(this.props.router.query.termTypeId ?? 1),
            postTypeId: Number(this.props.router.query.postTypeId ?? 1),
            searchKey: "",
            selectedPostTerms: [],
            listMode: "list",
            isShowToggleMenu: false,
            postTerms: [],
            showingPostTerms: []
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getPostTerms();
        this.props.setStateApp({
            isPageLoading: false
        })
    }

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t(PostTypes.findSingle("id", this.state.postTypeId)?.langKey ?? "[noLangAdd]"),
            this.props.t(PostTermTypes.findSingle("id", this.state.typeId)?.langKey ?? "[noLangAdd]")
        ])
    }

    async getPostTerms() {
        let postTerms = (await postTermService.get({
            typeId: this.state.typeId,
            postTypeId: this.state.postTypeId,
            langId: this.props.getStateApp.pageData.mainLangId
        })).data;
        this.setState({
            postTerms: postTerms,
            showingPostTerms: postTerms.filter(value => value.statusId !== StatusId.Deleted)
        })
    }

    onChangeStatus(event: any, statusId: number) {
        event.preventDefault();
        let selectedPostTermId = this.state.selectedPostTerms.map(postTerm => postTerm._id);

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

                    postTermService.delete({
                        termId: selectedPostTermId,
                        typeId: this.state.typeId,
                        postTypeId: this.state.postTypeId
                    }).then(resData => {
                        loadingToast.hide();
                        if (resData.status) {
                            this.setState((state: PageState) => {
                                state.postTerms = state.postTerms.filter(item => !selectedPostTermId.includes(item._id))
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

            postTermService.updateStatus({
                termId: selectedPostTermId,
                typeId: this.state.typeId,
                postTypeId: this.state.postTypeId,
                statusId: statusId
            }).then(resData => {
                loadingToast.hide();
                if (resData.status) {
                    this.setState((state: PageState) => {
                        state.postTerms.map((item, index) => {
                            if (selectedPostTermId.includes(item._id)) {
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

    onSelect(selectedRows: PageState["showingPostTerms"]) {
        this.setState((state: PageState) => {
            state.selectedPostTerms = selectedRows;
            state.isShowToggleMenu = selectedRows.length > 0;
            return state;
        })
    }

    onSearch(searchKey: string) {
        this.setState({
            searchKey: searchKey,
            showingPostTerms: this.state.showingPostTerms.filter(postTerm => (postTerm.contents?.title ?? "").toLowerCase().search(searchKey) > -1)
        })
    }

    onChangeListMode(mode: PageState["listMode"]) {
        this.setState((state: PageState) => {
            state.listMode = mode;
            state.showingPostTerms = [];
            state.selectedPostTerms = [];
            state.isShowToggleMenu = false;
            if (mode === "list") {
                state.showingPostTerms = state.postTerms.findMulti("statusId", StatusId.Deleted, false);
            } else {
                state.showingPostTerms = state.postTerms.findMulti("statusId", StatusId.Deleted);
            }
            return state;
        }, () => this.onSearch(this.state.searchKey))
    }

    navigateTermPage(type: "add" | "back" | "edit", postTermId = "") {
        let postTypeId = this.state.postTypeId;
        let postTermTypeId = this.state.typeId;
        let pagePath = [PostTypeId.Page, PostTypeId.Navigate].includes(Number(postTypeId)) ? PagePaths.post(postTypeId) : PagePaths.themeContent().post(postTypeId);
        let path = (type === "add")
            ? pagePath.term(postTermTypeId).add()
            : (type === "edit")
                ? pagePath.term(postTermTypeId).edit(postTermId)
                : pagePath.list();
        this.props.router.push(path);
    }

    get getTableColumns(): TableColumn<PageState["showingPostTerms"][0]>[] {
        return [
            {
                name: this.props.t("image"),
                width: "75px",
                cell: row => (
                    <div className="image pt-2 pb-2">
                        <img
                            src={imageSourceLib.getUploadedImageSrc(row.contents?.image)}
                            alt={row.contents?.title}
                        />
                    </div>
                )
            },
            {
                name: this.props.t("name"),
                selector: row => row.contents?.title || this.props.t("[noLangAdd]"),
                sortable: true,
            },
            {
                name: this.props.t("main"),
                selector: row => row.mainId ? row.mainId.contents?.title || this.props.t("[noLangAdd]") : this.props.t("notSelected"),
                sortable: true
            },
            {
                name: this.props.t("views"),
                selector: row => row.views,
                sortable: true
            },
            {
                name: this.props.t("status"),
                sortable: true,
                cell: row => (
                    <label
                        className={`badge badge-gradient-${classNameLib.getStatusClassName(row.statusId)}`}>
                        {
                            this.props.t(Status.findSingle("id", row.statusId)?.langKey ?? "[noLangAdd]")
                        }
                    </label>
                )
            },
            {
                name: "",
                width: "70px",
                button: true,
                cell: row => permissionLib.checkPermission(
                    this.props.getStateApp.sessionData.roleId,
                    this.props.getStateApp.sessionData.permissions,
                    permissionLib.getPermissionIdForPostType(row.postTypeId, "Edit")
                ) ? (
                    <button
                        className="btn btn-gradient-warning"
                        onClick={() => this.navigateTermPage("edit", row._id)}
                    ><i className="fa fa-pencil-square-o"></i></button>
                ) : null
            }
        ];
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-post-term">
                <div className="row">
                    <div className="col-md-3 mb-3">
                        <div className="row">
                            <div className="col-6">
                                <button className="btn btn-gradient-dark btn-lg w-100"
                                        onClick={() => this.navigateTermPage("back")}>
                                    <i className="mdi mdi-arrow-left"></i> {this.props.t("returnBack")}
                                </button>
                            </div>
                            <div className="col-6 text-end">
                                {
                                    permissionLib.checkPermission(
                                        this.props.getStateApp.sessionData.roleId,
                                        this.props.getStateApp.sessionData.permissions,
                                        permissionLib.getPermissionIdForPostType(this.state.postTypeId, "Add")
                                    ) ? <button className="btn btn-gradient-info btn-lg w-100"
                                                onClick={() => this.navigateTermPage("add")}>
                                        + {this.props.t("addNew")}
                                    </button> : null
                                }
                            </div>
                        </div>
                    </div>
                    <div className="col-md-9 mb-3 text-end">
                        {
                            this.state.listMode === "list"
                                ? <button className="btn btn-gradient-danger btn-lg list-mode-btn"
                                          onClick={() => this.onChangeListMode("deleted")}>
                                    <i className="mdi mdi-delete"></i> {this.props.t("trash")} ({this.state.postTerms.findMulti("statusId", StatusId.Deleted).length})
                                </button>
                                : <button className="btn btn-gradient-success btn-lg list-mode-btn"
                                          onClick={() => this.onChangeListMode("list")}>
                                    <i className="mdi mdi-view-list"></i> {this.props.t("list")} ({this.state.postTerms.findMulti("statusId", StatusId.Deleted, false).length})
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
                                                permissionLib.getPermissionIdForPostType(this.state.postTypeId, "Edit")
                                            ) ||
                                            permissionLib.checkPermission(
                                                this.props.getStateApp.sessionData.roleId,
                                                this.props.getStateApp.sessionData.permissions,
                                                permissionLib.getPermissionIdForPostType(this.state.postTypeId, "Delete")
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
                                                        permissionLib.getPermissionIdForPostType(this.state.postTypeId, "Delete")
                                                    ) ? [StatusId.Deleted] : []
                                                )
                                            }
                                            onChange={(event, statusId) => this.onChangeStatus(event, statusId)}
                                            langId={this.props.getStateApp.sessionData.langId}
                                        /> : null
                                    }
                                </div>
                                <ThemeDataTable
                                    columns={this.getTableColumns}
                                    data={this.state.showingPostTerms}
                                    onSelect={rows => this.onSelect(rows)}
                                    onSearch={searchKey => this.onSearch(searchKey)}
                                    selectedRows={this.state.selectedPostTerms}
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
