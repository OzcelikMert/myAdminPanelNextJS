import React, {Component} from 'react'
import {PermissionId, Status, StatusId} from "constants/index";
import {PagePropCommonDocument} from "types/pageProps";
import {TableColumn} from "react-data-table-component";
import ThemeTableToggleMenu from "components/theme/table/toggleMenu";
import Swal from "sweetalert2";
import classNameLib from "lib/className.lib";
import permissionLib from "lib/permission.lib";
import ThemeToast from "components/theme/toast";
import ThemeDataTable from "components/theme/table/dataTable";
import {NavigationDocument} from "types/services/navigation";
import navigationService from "services/navigation.service";
import PagePaths from "constants/pagePaths";
import {ThemeToggleMenuItemDocument} from "components/theme/table/toggleMenu";
import ThemeBadgeStatus from "components/theme/badge/status";
import ThemeTableUpdatedBy from "components/theme/table/updatedBy";

type PageState = {
    searchKey: string
    items: NavigationDocument[],
    showingItems: NavigationDocument[]
    selectedItems: NavigationDocument[]
    listMode: "list" | "deleted"
    isShowToggleMenu: boolean
};

type PageProps = {} & PagePropCommonDocument;

export default class PageNavigationList extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
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

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t("navigations"),
            this.props.t("list")
        ])
    }

    async getItems() {
        let items = (await navigationService.get({langId: this.props.getStateApp.pageData.langId})).data;
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

                let resData = await navigationService.delete({_id: selectedItemId});
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
            let resData = await navigationService.updateStatus({_id: selectedItemId, statusId: statusId});
            loadingToast.hide();
            if (resData.status) {
                this.setState((state: PageState) => {
                    state.items.map(item => {
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

    navigatePage(type: "edit", itemId = "") {
        let pagePath = PagePaths.navigation();
        let path = "";
        switch(type){
            case "edit": path = pagePath.edit(itemId); break;
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
                    PermissionId.NavigationDelete
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
                ) : this.props.t("title"),
                selector: row => row.contents?.title || this.props.t("[noLangAdd]"),
                cell: row => (
                    <div className="row w-100">
                        <div className="col-md-12">{row.contents?.title || this.props.t("[noLangAdd]")}</div>
                    </div>
                ),
                width: "250px",
                sortable: !this.state.isShowToggleMenu
            },
            {
                name: this.props.t("main"),
                selector: row => row.mainId ? row.mainId.contents?.title || this.props.t("[noLangAdd]") : this.props.t("notSelected"),
                sortable: true
            },
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
                    PermissionId.NavigationEdit
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
                    <div className="col-md-3"></div>
                    <div className="col-md-9 text-end">
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
                                            PermissionId.NavigationEdit
                                        ) ||
                                        permissionLib.checkPermission(
                                            this.props.getStateApp.sessionData.roleId,
                                            this.props.getStateApp.sessionData.permissions,
                                            PermissionId.NavigationDelete
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
