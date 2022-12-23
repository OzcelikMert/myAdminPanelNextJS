import React, {Component} from 'react'
import PagePaths from "constants/pagePaths";
import {ThemeFormSelect} from "components/elements/form";
import {PagePropCommonDocument} from "types/pageProps";
import LanguageDocument from "types/services/language";
import pathUtil from "utils/path.util";

type PageState = {};

type PageProps = {
    router: PagePropCommonDocument["router"]
    t: PagePropCommonDocument["t"]
    options: LanguageDocument[]
    value?: LanguageDocument
    onChange: (item: {label: string, value: any}, e: any) => void
};

export default class ThemeContentLanguage extends Component<PageProps, PageState> {
    Item = (props: LanguageDocument) => (
        <div className="row p-0">
            <div className="col-6 text-end">
                <img width="35" src={pathUtil.uploads.flags + props.image} alt={props.shortKey}/>
            </div>
            <div className="col-6 text-start content-language-title">
                <h6>{props.title}</h6>
            </div>
        </div>
    )


    render() {
        const showingPages = [
            PagePaths.component().edit(),
            PagePaths.post().edit(),
            PagePaths.post().term().edit(),
            PagePaths.themeContent().post().edit(),
            PagePaths.themeContent().post().term().edit(),
            PagePaths.settings().seo(),
            PagePaths.settings().staticLanguages()
        ];

        let isShow = showingPages.map(page => {
            return this.props.router.pathname.indexOf(page) > -1
        }).includes(true);

        return isShow ? (
            <ThemeFormSelect
                title={this.props.t("contentLanguage")}
                name="contentLanguageId"
                isSearchable={false}
                options={this.props.options.map(option => ({label: <this.Item {...option} />, value: option._id}))}
                value={ this.props.value ? {label: <this.Item {...this.props.value} />, value: this.props.value._id} : undefined }
                onChange={(item: any, e) => this.props.onChange(item, e)}
            />
        ) : <div></div>
    }
}
