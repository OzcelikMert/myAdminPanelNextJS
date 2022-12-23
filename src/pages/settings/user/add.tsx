import React, {Component, FormEvent} from 'react'
import {Tab, Tabs} from "react-bootstrap";
import moment from "moment";
import {PagePropCommonDocument} from "types/pageProps";
import {PermissionGroups, Permissions, StatusId, UserRoleId, UserRoles} from "constants/index";
import HandleForm from "library/react/handles/form";
import {ThemeFieldSet, ThemeForm, ThemeFormCheckBox, ThemeFormSelect, ThemeFormType} from "components/form";
import SweetAlert from "react-sweetalert2";
import V, {DateMask} from "library/variable";
import userService from "services/user.service";
import Thread from "library/thread";
import Spinner from "components/tools/spinner";
import staticContentUtil from "utils/staticContent.util";
import PagePaths from "constants/pagePaths";
import {UserUpdateParamDocument} from "types/services/user";

type PageState = {
    formActiveKey: string
    userRoles: { value: number, label: string }[]
    status: { value: number, label: string }[]
    mainTitle: string,
    isSubmitting: boolean
    formData: UserUpdateParamDocument,
    isSuccessMessage: boolean,
    isLoading: boolean
};

type PageProps = {} & PagePropCommonDocument;

export default class PageUserAdd extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            formActiveKey: "general",
            userRoles: [],
            status: [],
            mainTitle: "",
            isSubmitting: false,
            formData: {
                userId: this.props.getPageData.searchParams.userId,
                name: "",
                email: "",
                password: "",
                roleId: 0,
                statusId: 0,
                banDateEnd: new Date().getStringWithMask(DateMask.DATE),
                banComment: "",
                permissions: []
            },
            isSuccessMessage: false,
            isLoading: true
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        this.getRoles();
        this.getStatus();
        if (this.state.formData.userId) {
            await this.getUser();
        }
        this.setState({
            isLoading: false
        })
    }

    setPageTitle() {
        let titles: string[] = [
            this.props.t("settings"),
            this.props.t("users"),
            this.props.t(this.state.formData.userId ? "edit" : "add")
        ];
        if (this.state.formData.userId) {
            titles.push(this.state.mainTitle)
        }
        this.props.setBreadCrumb(titles);
    }

    getStatus() {
        this.setState((state: PageState) => {
            state.status = staticContentUtil.getStatusForSelect([
                StatusId.Active,
                StatusId.Pending,
                StatusId.Disabled,
                StatusId.Banned
            ], this.props.t);
            state.formData.statusId = StatusId.Active;
            return state;
        })
    }

    getRoles() {
        this.setState((state: PageState) => {
            let findUserRole = UserRoles.findSingle("id", this.props.getSessionData.roleId);
            state.userRoles = staticContentUtil.getUserRolesForSelect(
                UserRoles.map(userRole => findUserRole && (findUserRole.rank > userRole.rank) ? userRole.id : 0).filter(roleId => roleId !== 0),
                this.props.t
            );
            state.formData.roleId = UserRoleId.User;
            return state;
        })
    }

    async getUser() {
        let resData = await userService.get({
            userId: this.props.getPageData.searchParams.userId
        });
        if (resData.status) {
            if (resData.data.length > 0) {
                const user = resData.data[0];
                this.setState((state: PageState) => {
                    state.formData = Object.assign(state.formData, {
                        image: user.image,
                        name: user.name,
                        email: user.email,
                        password: "",
                        roleId: user.roleId,
                        statusId: user.statusId,
                        banDateEnd: user.banDateEnd,
                        banComment: user.banComment,
                        permissions: user.permissions
                    });

                    state.mainTitle = user.name;

                    return state;
                }, () => {
                    this.setPageTitle();
                })
            } else {
                this.navigateTermPage();
            }
        }
    }

    navigateTermPage() {
        let path = PagePaths.settings().user().list();
        this.props.router.navigate(path, {replace: true});
    }

    onSubmit(event: FormEvent) {
        event.preventDefault();
        this.setState({
            isSubmitting: true
        }, () => {
            let params = this.state.formData;

            ((params.userId)
                ? userService.update(params)
                : userService.add(params)).then(resData => {
                this.setState((state: PageState) => {
                    if (resData.status) {
                        state.isSuccessMessage = true;
                    }

                    state.isSubmitting = false;
                    return state;
                })
            });
        })
    }

    onPermissionSelected(isSelected: boolean, permId: number) {
        this.setState((state: PageState) => {
            if (isSelected) {
                state.formData.permissions.push(permId);
            } else {
                let findIndex = state.formData.permissions.indexOfKey("", permId);
                if (findIndex > -1) state.formData.permissions.remove(findIndex);
            }
            return state;
        })
    }

    onPermissionAllSelected(isSelected: boolean) {
        this.setState((state: PageState) => {
            if (isSelected) {
                state.formData.permissions = Permissions.map(perm => perm.id);
            } else {
                state.formData.permissions = [];
            }
            return state;
        })
    }

    onChangeUserRole(roleId: number) {
        let role = UserRoles.findSingle("id", roleId);
        let permsForRole = Permissions.filter(perm => role && (perm.defaultRoleRank <= role.rank));
        this.setState((state: PageState) => {
            state.formData.permissions = [];
            permsForRole.forEach(perm => {
                state.formData.permissions.push(perm.id);
            })
            return state;
        });
    }

    onCloseSuccessMessage() {
        this.setState({
            isSuccessMessage: false
        });
        this.navigateTermPage()
    }

    Messages = () => {
        return (
            <SweetAlert
                show={this.state.isSuccessMessage}
                title={this.props.t("successful")}
                text={`${this.props.t((V.isEmpty(this.props.getPageData.searchParams.userId)) ? "itemAdded" : "itemEdited")}!`}
                icon="success"
                timer={1000}
                timerProgressBar={true}
                didClose={() => this.onCloseSuccessMessage()}
            />
        )
    }

    TabPermissions = (props: any) => {
        return (
            <div className="row">
                <div className="col-md-12 mb-3">
                    <ThemeFormCheckBox
                        title={this.props.t("selectAll")}
                        name="permAll"
                        checked={Permissions.length === this.state.formData.permissions.length}
                        onChange={e => this.onPermissionAllSelected(e.target.checked)}
                    />
                </div>
                {
                    PermissionGroups.map((group, index) => (
                        <div className="col-md-6 mb-3">
                            <ThemeFieldSet
                                key={index}
                                legend={this.props.t(group.langKey)}
                            >
                                {
                                    Permissions.findMulti("groupId", group.id).map((perm, index) => (
                                        <div className="col-md-4" key={index}>
                                            <ThemeFormCheckBox
                                                key={index}
                                                title={this.props.t(perm.langKey)}
                                                name="permissions"
                                                checked={this.state.formData.permissions.includes(perm.id)}
                                                onChange={e => this.onPermissionSelected(e.target.checked, perm.id)}
                                            />
                                        </div>
                                    ))
                                }
                            </ThemeFieldSet>
                        </div>
                    ))
                }
            </div>
        );
    }

    TabOptions = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormSelect
                        title={this.props.t("status")}
                        name="statusId"
                        options={this.state.status}
                        value={this.state.status?.findSingle("value", this.state.formData.statusId)}
                        onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item.value, this)}
                    />
                </div>
                {
                    this.state.formData.statusId == StatusId.Banned ?
                        <div className="col-md-7 mb-3">
                            <div className="mb-3">
                                <ThemeFormType
                                    title={`${this.props.t("banDateEnd")}*`}
                                    type="date"
                                    name="banDateEnd"
                                    value={moment(this.state.formData.banDateEnd).format("YYYY-MM-DD")}
                                    onChange={(event) => HandleForm.onChangeInput(event, this)}
                                />
                            </div>
                            <div className="mb-3">
                                <ThemeFormType
                                    title={this.props.t("banComment")}
                                    name="banComment"
                                    type="textarea"
                                    value={this.state.formData.banComment}
                                    onChange={e => HandleForm.onChangeInput(e, this)}
                                />
                            </div>
                        </div> : null
                }
            </div>
        );
    }

    TabGeneral = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={`${this.props.t("name")}*`}
                        name="name"
                        type="text"
                        required={true}
                        value={this.state.formData.name}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={`${this.props.t("email")}*`}
                        name="email"
                        type="email"
                        required={true}
                        autoComplete={"new-password"}
                        value={this.state.formData.email}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={`${this.props.t("password")}*`}
                        name="password"
                        type="password"
                        autoComplete={"new-password"}
                        required={V.isEmpty(this.props.getPageData.searchParams.userId)}
                        value={this.state.formData.password}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormSelect
                        title={this.props.t("role")}
                        name="roleId"
                        placeholder={this.props.t("chooseRole")}
                        options={this.state.userRoles}
                        value={this.state.userRoles?.findSingle("value", this.state.formData.roleId)}
                        onChange={(item: any, e) => {
                            HandleForm.onChangeSelect(e.name, item.value, this);
                            this.onChangeUserRole(item.value);
                        }}
                    />
                </div>
            </div>
        );
    }

    render() {
        return this.state.isLoading ? <Spinner /> : (
            <div className="page-user">
                <this.Messages/>
                <div className="navigate-buttons mb-3">
                    <button className="btn btn-gradient-dark btn-lg btn-icon-text"
                            onClick={() => this.navigateTermPage()}>
                        <i className="mdi mdi-arrow-left"></i> {this.props.t("returnBack")}
                    </button>
                </div>
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <ThemeForm
                                isActiveSaveButton={true}
                                saveButtonText={this.props.t("save")}
                                saveButtonLoadingText={this.props.t("loading")}
                                isSubmitting={this.state.isSubmitting}
                                formAttributes={{onSubmit: (event) => this.onSubmit(event), autoComplete: "new-password"}}
                            >
                                <div className="card-body">
                                    <div className="theme-tabs">
                                        <Tabs
                                            onSelect={(key: any) => this.setState({formActiveKey: key})}
                                            activeKey={this.state.formActiveKey}
                                            className="mb-5"
                                            transition={false}>
                                            <Tab eventKey="general" title={this.props.t("general")}>
                                                <this.TabGeneral/>
                                            </Tab>
                                            <Tab eventKey="options" title={this.props.t("options")}>
                                                <this.TabOptions/>
                                            </Tab>
                                            <Tab eventKey="permissions" title={this.props.t("permissions")}>
                                                <this.TabPermissions/>
                                            </Tab>
                                        </Tabs>
                                    </div>
                                </div>
                            </ThemeForm>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
