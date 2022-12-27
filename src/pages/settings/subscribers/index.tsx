import React, {Component} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import {PermissionId, StatusId} from "constants/index";
import  {TableColumn} from "react-data-table-component";
import Swal from "sweetalert2";
import Spinner from "components/tools/spinner";
import permissionUtil from "utils/permission.util";
import ThemeToast from "components/elements/toast";
import {SubscriberDocument} from "types/services/subscriber";
import subscriberService from "services/subscriber.service";
import {ThemeTableToggleMenu} from "components/elements/table";
import ThemeDataTable from "components/elements/table/dataTable";

type PageState = {
    searchKey: string
    subscribers: SubscriberDocument[]
    showingSubscribers: PageState["subscribers"]
    selectedSubscribers: PageState["subscribers"]
    isShowToggleMenu: boolean
    isLoading: boolean
};

type PageProps = {} & PagePropCommonDocument;

export default class PageSubscribers extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            searchKey: "",
            showingSubscribers: [],
            subscribers: [],
            selectedSubscribers: [],
            isShowToggleMenu: false,
            isLoading: true
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getSubscribers();
        this.setState({
            isLoading: false
        })
    }

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t("settings"),
            this.props.t("subscribers")
        ])
    }

    async getSubscribers() {
        let subscribers = (await subscriberService.get({})).data;
        this.setState({
            subscribers: subscribers
        }, () => this.onSearch(this.state.searchKey));
    }

    onDelete(event: any) {
        event.preventDefault();
        let selectedSubscribeId = this.state.selectedSubscribers.map(post => post._id);

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

                subscriberService.delete({
                    _id: selectedSubscribeId
                }).then(resData => {
                    loadingToast.hide();
                    if (resData.status) {
                        this.setState((state: PageState) => {
                            state.subscribers = state.subscribers.filter(item => !selectedSubscribeId.includes(item._id));
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
                })
            }
        })
    }

    onSelect(selectedRows: PageState["subscribers"]) {
        this.setState((state: PageState) => {
            state.selectedSubscribers = selectedRows;
            state.isShowToggleMenu = selectedRows.length > 0;
            return state;
        })
    }

    onSearch(searchKey: string) {
        this.setState({
            searchKey: searchKey,
            showingSubscribers: this.state.subscribers.filter(subscriber => subscriber.email.toLowerCase().search(searchKey) > -1)
        })
    }

    get getTableColumns(): TableColumn<PageState["subscribers"][0]>[] {
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
        return this.state.isLoading ? <Spinner/> : (
            <div className="page-post-term">
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="table-post">
                                <div className={`ms-2 ${!this.state.isShowToggleMenu ? "invisible" : ""}`}>
                                    {
                                        (
                                            permissionUtil.checkPermission(
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
                                    data={this.state.showingSubscribers}
                                    selectedRows={this.state.selectedSubscribers}
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
