import React, {Component} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import {PermissionId, StatusId} from "constants/index";
import  {TableColumn} from "react-data-table-component";
import Swal from "sweetalert2";
import permissionLib from "lib/permission.lib";
import ThemeToast from "components/elements/toast";
import {SubscriberDocument} from "types/services/subscriber";
import subscriberService from "services/subscriber.service";
import {ThemeTableToggleMenu} from "components/elements/table";
import ThemeDataTable from "components/elements/table/dataTable";

type PageState = {
    searchKey: string
    items: SubscriberDocument[]
    showingItems: PageState["items"]
    selectedItems: PageState["items"]
    isShowToggleMenu: boolean
};

type PageProps = {} & PagePropCommonDocument;

export default class PageSubscribers extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            searchKey: "",
            showingItems: [],
            items: [],
            selectedItems: [],
            isShowToggleMenu: false
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
            this.props.t("settings"),
            this.props.t("subscribers")
        ])
    }

    async getItems() {
        let items = (await subscriberService.get({})).data;
        this.setState({
            items: items
        }, () => this.onSearch(this.state.searchKey));
    }

    async onDelete(event: any) {
        event.preventDefault();
        let selectedItemId = this.state.selectedItems.map(item => item._id);

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

            let resData = await subscriberService.delete({
                _id: selectedItemId
            });
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
                    this.onSearch(this.state.searchKey)
                })
            }
        }
    }

    onSelect(selectedRows: PageState["items"]) {
        this.setState((state: PageState) => {
            state.selectedItems = selectedRows;
            state.isShowToggleMenu = selectedRows.length > 0;
            return state;
        })
    }

    onSearch(searchKey: string) {
        this.setState({
            searchKey: searchKey,
            showingItems: this.state.items.filter(item => item.email.toLowerCase().search(searchKey) > -1)
        })
    }

    get getTableColumns(): TableColumn<PageState["items"][0]>[] {
        return [
            {
                name: this.props.t("email"),
                selector: row => row.email,
                sortable: true,
            },
            {
                name: this.props.t("createdDate"),
                selector: row => new Date(row.createdAt).toLocaleDateString(),
                sortable: true
            }
        ];
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-post-term">
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
                                                PermissionId.SubscriberEdit
                                            )
                                        ) ? <ThemeTableToggleMenu
                                            t={this.props.t}
                                            status={
                                                [
                                                    StatusId.Deleted
                                                ]
                                            }
                                            onChange={(event, statusId) => this.onDelete(event)}
                                            langId={this.props.getStateApp.sessionData.langId}
                                        /> : null
                                    }
                                </div>
                                <ThemeDataTable
                                    columns={this.getTableColumns}
                                    data={this.state.showingItems}
                                    selectedRows={this.state.selectedItems}
                                    t={this.props.t}
                                    onSelect={rows => this.onSelect(rows)}
                                    onSearch={searchKey => this.onSearch(searchKey)}
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
