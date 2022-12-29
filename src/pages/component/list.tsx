import React, {Component} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import {PermissionId, UserRoleId} from "constants/index";
import {TableColumn} from "react-data-table-component";
import Swal from "sweetalert2";
import permissionLib from "lib/permission.lib";
import ThemeToast from "components/elements/toast";
import {ComponentDocument} from "types/services/component";
import componentService from "services/component.service";
import PagePaths from "constants/pagePaths";
import ThemeDataTable from "components/elements/table/dataTable";

type PageState = {
    searchKey: string
    components: ComponentDocument[]
    showingComponents: PageState["components"]
};

type PageProps = {} & PagePropCommonDocument;

export default class PageComponentList extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            searchKey: "",
            showingComponents: [],
            components: []
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getComponents();
        this.props.setStateApp({
            isPageLoading: false
        })
    }

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t("components"),
            this.props.t("list"),
        ])
    }

    async getComponents() {
        let components = (await componentService.get({langId: this.props.getStateApp.pageData.langId})).data;
        this.setState((state: PageState) => {
            state.components = components;
            return state;
        }, () => this.onSearch(this.state.searchKey));
    }

    onDelete(_id: string) {
        let component = this.state.components.findSingle("_id", _id);
        if(component){
            Swal.fire({
                title: this.props.t("deleteAction"),
                html: `<b>'${this.props.t(component.langKey)}'</b> ${this.props.t("deleteItemQuestionWithItemName")}`,
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
                    componentService.delete({
                        componentId: [_id]
                    }).then(resData => {
                        loadingToast.hide();
                        if (resData.status) {
                            this.setState((state: PageState) => {
                                state.components = state.components.filter(item => _id !== item._id);
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

    onSearch(searchKey: string) {
        this.setState({
            searchKey: searchKey,
            showingComponents: this.state.components.filter(component => this.props.t(component.langKey).toLowerCase().search(searchKey) > -1)
        })
    }

    navigateTermPage(type: "edit", itemId = "") {
        let path = PagePaths.component().edit(itemId)
        this.props.router.push(path);
    }

    get getTableColumns(): TableColumn<PageState["components"][0]>[] {
        return [
            {
                name: this.props.t("title"),
                selector: row => this.props.t(row.langKey),
                sortable: true
            },
            {
                name: this.props.t("updatedBy"),
                sortable: true,
                selector: row => row.lastAuthorId.name
            },
            {
                name: "",
                button: true,
                width: "70px",
                cell: row => permissionLib.checkPermission(
                    this.props.getStateApp.sessionData.roleId,
                    this.props.getStateApp.sessionData.permissions,
                    PermissionId.ComponentEdit
                ) ? (
                    <button
                        onClick={() => this.navigateTermPage("edit", row._id)}
                        className="btn btn-gradient-warning"
                    ><i className="fa fa-pencil-square-o"></i>
                    </button>
                ) : null
            },
            (
                this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                    ? {
                        name: "",
                        button: true,
                        width: "70px",
                        cell: row => (
                            <button
                                onClick={() => this.onDelete(row._id)}
                                className="btn btn-gradient-danger"
                            ><i className="mdi mdi-trash-can-outline"></i>
                            </button>
                        )
                    } : {}
            )
        ];
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-post">
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="table-post">
                                <ThemeDataTable
                                    columns={this.getTableColumns.filter(column => typeof column.name !== "undefined")}
                                    data={this.state.showingComponents}
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