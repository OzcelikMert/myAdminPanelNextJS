import React, {Component} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import {PermissionId, UserRoleId} from "constants/index";
import {TableColumn} from "react-data-table-component";
import Swal from "sweetalert2";
import Thread from "library/thread";
import Spinner from "components/tools/spinner";
import permissionUtil from "utils/permission.util";
import ThemeToast from "components/toast";
import {ComponentDocument} from "types/services/component";
import componentService from "services/component.service";
import PagePaths from "constants/pagePaths";
import ThemeDataTable from "components/table/dataTable";

type PageState = {
    searchKey: string
    components: ComponentDocument[]
    showingComponents: PageState["components"]
    isLoading: boolean
};

type PageProps = {} & PagePropCommonDocument;

export default class PageComponentList extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            searchKey: "",
            showingComponents: [],
            components: [],
            isLoading: true
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getComponents();
        this.setState({
            isLoading: false
        })
    }

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t("components"),
            this.props.t("list"),
        ])
    }

    async getComponents() {
        let components = (await componentService.get({langId: this.props.getPageData.langId})).data;
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
        this.props.router.navigate(path, {replace: true});
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
                cell: row => permissionUtil.checkPermission(
                    this.props.getSessionData.roleId,
                    this.props.getSessionData.permissions,
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
                this.props.getSessionData.roleId == UserRoleId.SuperAdmin
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
        ].filter(column => typeof column.name !== "undefined");
    }

    render() {
        return this.state.isLoading ? <Spinner/> : (
            <div className="page-post">
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="table-post">
                                <ThemeDataTable
                                    columns={this.getTableColumns}
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
