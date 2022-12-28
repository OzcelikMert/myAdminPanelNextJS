import React, {Component} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import {PermissionId, Status, UserRoleId, UserRoles} from "constants/index";
import {TableColumn} from "react-data-table-component";
import Swal from "sweetalert2";
import UserDocument from "types/services/user";
import ThemeUsersProfileCard from "components/elements/users/profileCard";
import userService from "services/user.service";
import imageSourceLib from "lib/imageSource.lib";
import classNameLib from "lib/className.lib";
import permissionLib from "lib/permission.lib";
import ThemeToast from "components/elements/toast";
import PagePaths from "constants/pagePaths";
import ThemeDataTable from "components/elements/table/dataTable";
import Image from "next/image"

type PageState = {
    searchKey: string
    users: UserDocument[]
    showingUsers: PageState["users"]
    isViewUserInfo: boolean
    selectedUserId: string
};

type PageProps = {} & PagePropCommonDocument;

export default class PageUserList extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            searchKey: "",
            showingUsers: [],
            users: [],
            isViewUserInfo: false,
            selectedUserId: ""
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getUsers();
        this.props.setStateApp({
            isPageLoading: false
        })
    }

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t("settings"),
            this.props.t("users"),
            this.props.t("list"),
        ])
    }

    async getUsers() {
        let users = (await userService.get({})).data;
        this.setState((state: PageState) => {
            state.users = state.users.sort(user => {
                let sort = 0;
                if (user._id == this.props.getStateApp.sessionData.id) {
                    sort = 1;
                }
                return sort;
            })
            state.users = users.filter(user => user.roleId != UserRoleId.SuperAdmin);
            return state;
        }, () => this.onSearch(this.state.searchKey));
    }

    onDelete(userId: string) {
        let user = this.state.users.findSingle("_id", userId);
        if (user) {
            Swal.fire({
                title: this.props.t("deleteAction"),
                html: `<b>'${user.name}'</b> ${this.props.t("deleteItemQuestionWithItemName")}`,
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
                    userService.delete({
                        userId: userId
                    }).then(resData => {
                        loadingToast.hide();
                        if (resData.status) {
                            this.setState((state: PageState) => {
                                state.users = state.users.filter(item => userId !== item._id);
                                return state;
                            }, () => {
                                new ThemeToast({
                                    type: "success",
                                    title: this.props.t("successful"),
                                    content: this.props.t("itemDeleted")
                                })
                            })
                        }
                    })
                }
            })
        }
    }

    onViewUser(userId: string) {
        this.setState({
            isViewUserInfo: true,
            selectedUserId: userId
        })
    }

    onSearch(searchKey: string) {
        this.setState({
            searchKey: searchKey,
            showingUsers: this.state.users.filter(user => user.name.toLowerCase().search(searchKey) > -1)
        })
    }

    navigateTermPage(type: "edit", itemId = "") {
        let path = PagePaths.settings().user().edit(itemId)
        this.props.router.push(path);
    }

    get getTableColumns(): TableColumn<PageState["users"][0]>[] {
        return [
            {
                name: this.props.t("image"),
                width: "100px",
                cell: row => (
                    <div className="image mt-2 mb-2">
                        <Image
                            src={imageSourceLib.getUploadedImageSrc(row.image)}
                            alt={row.name}
                            width={75}
                            height={75}
                            className="img-fluid"
                        />
                        <span className={`availability-status ${row.isOnline ? "online" : "offline"}`}></span>
                    </div>
                )
            },
            {
                name: this.props.t("name"),
                selector: row => row.name,
                sortable: true,
                cell: row => (
                    <b>{row.name}</b>
                )
            },
            {
                id: "userRole",
                name: this.props.t("role"),
                selector: row => UserRoles.findSingle("id", row.roleId)?.rank ?? 0,
                sortable: true,
                cell: row => (
                    <label className={`badge badge-gradient-${classNameLib.getUserRolesClassName(row.roleId)}`}>
                        {
                            this.props.t(UserRoles.findSingle("id", row.roleId)?.langKey ?? "[noLangAdd]")
                        }
                    </label>
                )
            },
            {
                name: this.props.t("status"),
                selector: row => Status.findSingle("id", row.statusId)?.order ?? 0,
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
                name: "",
                width: "70px",
                cell: row => (
                    <button
                        onClick={() => this.onViewUser(row._id)}
                        className="btn btn-gradient-info"
                    ><i className="mdi mdi-eye"></i></button>
                )
            },
            {
                name: "",
                button: true,
                width: "70px",
                cell: row => {
                    let sessionUserRole = UserRoles.findSingle("id", this.props.getStateApp.sessionData.roleId);
                    let rowUserRole = UserRoles.findSingle("id", row.roleId);
                    return (
                        (sessionUserRole && rowUserRole) &&
                        (rowUserRole.rank < sessionUserRole.rank) &&
                        permissionLib.checkPermission(
                            this.props.getStateApp.sessionData.roleId,
                            this.props.getStateApp.sessionData.permissions,
                            PermissionId.UserEdit
                        )
                    ) ? <button
                        onClick={() => this.navigateTermPage("edit", row._id)}
                        className="btn btn-gradient-warning"
                    ><i className="fa fa-pencil-square-o"></i>
                    </button> : null;
                }
            },
            {
                name: "",
                button: true,
                width: "70px",
                cell: row => {
                    let sessionUserRole = UserRoles.findSingle("id", this.props.getStateApp.sessionData.roleId);
                    let rowUserRole = UserRoles.findSingle("id", row.roleId);
                    return (
                        (sessionUserRole && rowUserRole) &&
                        (rowUserRole.rank < sessionUserRole.rank) &&
                        permissionLib.checkPermission(
                            this.props.getStateApp.sessionData.roleId,
                            this.props.getStateApp.sessionData.permissions,
                            PermissionId.UserDelete
                        )
                    ) ? <button
                        onClick={() => this.onDelete(row._id)}
                        className="btn btn-gradient-danger"
                    ><i className="mdi mdi-trash-can-outline"></i>
                    </button> : null;
                }
            }
        ];
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-user">
                {
                    (() => {
                        let userInfo = this.state.users.findSingle("_id", this.state.selectedUserId);
                        return userInfo ? <ThemeUsersProfileCard
                            router={this.props.router}
                            t={this.props.t}
                            onClose={() => {
                                this.setState({isViewUserInfo: false})
                            }}
                            isShow={this.state.isViewUserInfo}
                            userInfo={userInfo}
                            langId={this.props.getStateApp.sessionData.langId}
                        /> : null
                    })()
                }
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="table-user">
                                <ThemeDataTable
                                    columns={this.getTableColumns}
                                    data={this.state.showingUsers}
                                    t={this.props.t}
                                    onSearch={searchKey => this.onSearch(searchKey)}
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
