import React, {Component} from 'react';
import {PagePropCommonDocument} from "types/pageProps";
import {LanguageId} from "constants/index";
import Navbar from "components/tools/navbar";
import Sidebar from "components/tools/sidebar";
import Footer from "components/tools/footer";
import {AppAdminGetState, AppAdminSetState} from "types/pages/_app";
import languageService from "services/language.service";
import settingService from "services/setting.service";
import LanguageDocument from "types/services/language";
import PagePaths from "constants/pagePaths";
import ThemeBreadCrumb from "components/elements/breadCrumb";
import ThemeContentLanguage from "components/elements/contentLanguage";
import Spinner from "components/tools/spinner";
import ProviderAuth from "components/providers/providerAuth";
import ProviderPermission from "components/providers/providerPermission";
import {AppProps} from "next/app";
import ComponentHead from "components/head";
import {useTranslation} from "react-i18next";


type PageState = {
    contentLanguages: LanguageDocument[],
    breadCrumbTitle: string,
    isPageLoading: boolean,
} & AppAdminGetState;

type PageProps = {} & AppProps

export default class AppAdmin extends Component<PageProps, PageState> {
    oldLocation = "";

    constructor(props: PageProps) {
        super(props);
        this.state = {
            breadCrumbTitle: "",
            contentLanguages: [],
            isPageLoading: true,
            pageData: {
                langId: "",
                mainLangId: "",
            },
            sessionData: {
                id: "",
                langId: LanguageId.English,
                image: "",
                name: "",
                email: "",
                roleId: 1,
                permissions: []
            }
        }
    }

    async componentDidMount() {
        this.setState({
            isPageLoading: true
        }, async () => {
            await this.getContentLanguages();
            await this.getContentMainLanguage();
            await this.onRouteChanged();
            this.setState({
                isPageLoading: false
            })
        })
    }

    async componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<PageState>) {
        if (this.props.router.pathname !== prevProps.router.pathname) {
            await this.onRouteChanged();
        }
    }

    async onRouteChanged() {
        this.setState({
            isPageLoading: true,
        }, async () => {
            this.setState((state: PageState) => {
                state.pageData.langId = state.pageData.mainLangId;
                return state;
            }, () => this.setState({isPageLoading: false}))
        })
    }

    setBreadCrumb(titles: string[]) {
        this.setState((state: PageState) => {
            state.breadCrumbTitle = "";
            titles.forEach(title => {
                state.breadCrumbTitle += `${title} - `;
            })
            state.breadCrumbTitle = state.breadCrumbTitle.removeLastChar(2);
            return state;
        })
    }

    setSessionData(data: AppAdminSetState["sessionData"], callBack?: () => void) {
        this.setState((state: PageState) => {
            state.sessionData = Object.assign(state.sessionData, data);
            return state;
        }, () => {
            if (callBack) {
                callBack();
            }
        })
    }

    setPageData(data: AppAdminSetState["pageData"], callBack?: () => void) {
        this.setState((state: PageState) => {
            state.pageData = Object.assign(state.pageData, data);
            return state;
        }, () => {
            if (callBack) {
                callBack();
            }
        })
    }

    async getContentLanguages() {
        let resData = await languageService.get({});
        if (resData.status) {
            this.setState({
                contentLanguages: resData.data
            })
        }
    }

    async getContentMainLanguage() {
        let resData = await settingService.get({})
        if (resData.status) {
            let data = resData.data[0];
            this.setState((state: PageState) => {
                state.pageData.mainLangId = data.defaultLangId;
                state.pageData.langId = data.defaultLangId;
                return state;
            })
        }
    }

    render() {
        const fullPageLayoutRoutes = [
            PagePaths.login(),
            PagePaths.lock()
        ];
        let isFullPageLayout = fullPageLayoutRoutes.includes(this.props.router.pathname);

        if (this.oldLocation !== this.props.router.pathname) {
            this.oldLocation = this.props.router.pathname;
            return null;
        }

        const commonProps: PagePropCommonDocument = {
            router: this.props.router,
            t: useTranslation().t,
            setBreadCrumb: titles => this.setBreadCrumb(titles),
            setSessionData: (data, callBack) => this.setSessionData(data, callBack),
            getSessionData: this.state.sessionData,
            getPageData: this.state.pageData,
            setPageData: (data, callBack) => this.setPageData(data, callBack)
        };


        return this.state.isPageLoading ? <Spinner isFullPage={true} /> : (
            <>
                <ComponentHead title={this.state.breadCrumbTitle} />
                <div className="container-scroller">
                    {!isFullPageLayout && this.state.sessionData.id.length > 0 ? <Navbar {...commonProps}/> : null}
                    <div
                        className={`container-fluid page-body-wrapper ${isFullPageLayout ? "full-page-wrapper" : ""}`}>
                        {!isFullPageLayout && this.state.sessionData.id.length > 0 ? <Sidebar {...commonProps}/> : null}
                        <ProviderAuth {...commonProps} isFullPage={isFullPageLayout}>
                            <ProviderPermission {...commonProps} isFullPage={isFullPageLayout}>
                                <div className="main-panel">
                                    <div className="content-wrapper">
                                        {
                                            !isFullPageLayout ?
                                                <div className="page-header">
                                                    <div className="row w-100 m-0">
                                                        <div className="col-md-8 p-0">
                                                            <ThemeBreadCrumb
                                                                breadCrumbs={this.state.breadCrumbTitle.split(" - ")}/>
                                                        </div>
                                                        <div className="col-md-4 p-0 content-language">
                                                            <ThemeContentLanguage
                                                                t={commonProps.t}
                                                                router={this.props.router}
                                                                options={this.state.contentLanguages}
                                                                value={this.state.contentLanguages.findSingle("_id", this.state.pageData.langId)}
                                                                onChange={(item, e) => this.setState((state: PageState) => {
                                                                    return {
                                                                        ...state,
                                                                        pageData: {
                                                                            ...state.pageData,
                                                                            langId: item.value
                                                                        }
                                                                    };
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div> : null
                                        }
                                        <this.props.Component {...commonProps}/>
                                    </div>
                                    {!isFullPageLayout ? <Footer/> : ''}
                                </div>
                            </ProviderPermission>
                        </ProviderAuth>
                    </div>
                </div>
            </>
        );
    }
}
