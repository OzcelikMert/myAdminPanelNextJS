import React, {Component} from 'react';
import {PagePropCommonDocument} from "types/pageProps";
import languageService from "services/language.service";
import settingService from "services/setting.service";
import {StatusId} from "constants/status";

type PageState = {};

type PageProps = {
    children?: any
} & PagePropCommonDocument;

export default class ProviderAppInit extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {}
    }

    async componentDidMount() {
        if(this.props.getStateApp.isAppLoading){
            await this.getContentLanguages();
            await this.getContentMainLanguage();
            this.props.setStateApp({
                isAppLoading: false
            })
        }
    }

    async getContentLanguages() {
        let resData = await languageService.getMany({statusId: StatusId.Active});
        if (resData.status) {
            this.props.setStateApp({
                contentLanguages: resData.data
            })
        }
    }

    async getContentMainLanguage() {
        let resData = await settingService.get({projection: "general"});
        if (resData.status && resData.data) {
            let data = resData.data;
            this.props.setStateApp({
                pageData: {
                    mainLangId: data.defaultLangId,
                    langId: data.defaultLangId
                }
            })
        }
    }

    render() {
        if(this.props.getStateApp.isAppLoading){
            return null;
        }

        return this.props.children;
    }
}