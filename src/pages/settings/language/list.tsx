import React, {Component} from 'react'
import {PermissionId, Status, StatusId} from "constants/index";
import {PagePropCommonDocument} from "types/pageProps";
import {TableColumn} from "react-data-table-component";
import classNameLib from "lib/className.lib";
import permissionLib from "lib/permission.lib";
import ThemeDataTable from "components/elements/table/dataTable";
import PagePaths from "constants/pagePaths";
import LanguageDocument from "types/services/language";
import languageService from "services/language.service";
import Image from "next/image";
import imageSourceLib from "lib/imageSource.lib";
import ThemeBadgeStatus from "components/elements/badge/status";

type PageState = {
    searchKey: string
    items: LanguageDocument[],
    showingItems: LanguageDocument[]
};

type PageProps = {} & PagePropCommonDocument;

export default class PageSettingLanguageList extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            searchKey: "",
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
            this.props.t("settings"),
            this.props.t("languages"),
            this.props.t("list")
        ])
    }

    async getItems() {
        let items = (await languageService.get({})).data;
        this.setState((state: PageState) => {
            state.items = items;
            state.showingItems = items;
            return state;
        });
    }


    onSearch(searchKey: string) {
        this.setState({
            searchKey: searchKey,
            showingItems: this.state.showingItems.filter(item => (item.title ?? "").toLowerCase().search(searchKey) > -1)
        })
    }

    navigatePage(type: "edit", itemId = "") {
        let pagePath = PagePaths.settings().language();
        let path = "";
        switch(type){
            case "edit": path = pagePath.edit(itemId); break;
        }
        this.props.router.push(path);
    }

    get getTableColumns(): TableColumn<PageState["showingItems"][0]>[] {
        return [
            {
                name: this.props.t("image"),
                width: "105px",
                cell: row => (
                    <div className="image mt-2 mb-2">
                        <Image
                            src={imageSourceLib.getUploadedFlagSrc(row.image)}
                            alt={row.title}
                            width={75}
                            height={75}
                            className="img-fluid"
                        />
                    </div>
                )
            },
            {
                name: this.props.t("title"),
                selector: row => row.title,
                cell: row => (
                    <div className="row w-100">
                        <div className="col-md-12">{row.title} ({row.shortKey}-{row.locale})</div>
                    </div>
                ),
                width: "250px",
                sortable: true
            },
            {
                name: this.props.t("status"),
                sortable: true,
                cell: row => <ThemeBadgeStatus t={this.props.t} statusId={row.statusId} />
            },
            {
                name: "",
                width: "70px",
                button: true,
                cell: row => (
                    <button
                        onClick={() => this.navigatePage("edit", row._id)}
                        className="btn btn-gradient-warning"
                    ><i className="fa fa-pencil-square-o"></i></button>
                )
            }
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
                                    data={this.state.showingItems}
                                    onSearch={searchKey => this.onSearch(searchKey)}
                                    t={this.props.t}
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
