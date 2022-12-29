import React, {Component} from 'react';
import {PagePropCommonDocument} from "types/pageProps";
import {LanguageId} from "constants/index";
import Navbar from "components/tools/navbar";
import Sidebar from "components/tools/sidebar";
import Footer from "components/tools/footer";
import {AppAdminGetState, AppAdminSetState} from "types/pages/_app";
import LanguageDocument from "types/services/language";
import PagePaths from "constants/pagePaths";
import ThemeBreadCrumb from "components/elements/breadCrumb";
import ThemeContentLanguage from "components/elements/contentLanguage";
import Spinner from "components/tools/spinner";
import {AppProps} from "next/app";
import ComponentHead from "components/head";
import {useTranslation} from "react-i18next";
import ProviderAuth from "components/providers/auth.provider";
import ProviderPermission from "components/providers/permission.provider";
import ProviderAppInit from "components/providers/app.init.provider";
import Variable from "library/variable";
import {ToastContainer} from "react-toastify";

type PageState = {
    contentLanguages: LanguageDocument[],
    breadCrumbTitle: string
} & AppAdminGetState;

type PageProps = {
    t: PagePropCommonDocument["t"]
} & AppProps

class AppAdmin extends Component<PageProps, PageState> {
    pathname: string;

    constructor(props: PageProps) {
        super(props);
        this.pathname = this.props.router.asPath;
        this.state = {
            breadCrumbTitle: "",
            contentLanguages: [],
            isAppLoading: true,
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

    async componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<PageState>) {
        if (this.pathname !== this.props.router.asPath) {
            console.log(this.pathname, this.props.router.pathname)
            this.pathname = this.props.router.asPath;
            await this.onRouteChanged()
        }
    }

    async onRouteChanged() {
        this.setState({
            isPageLoading: true,
        }, async () => {
            this.setState({
                pageData: {
                    ...this.state.pageData,
                    langId: this.state.pageData.mainLangId
                }
            }, () => {
                window.scrollTo(0, 0);
            })
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

    setStateApp(data: AppAdminSetState, callBack?: () => void) {
        this.setState((state: PageState) => {
            state = Variable.nestedObjectAssign(Object.create(state), data);
            return state;
        }, () => {
            if (callBack) {
                callBack();
            }
        })
    }

    render() {
        if (this.pathname !== this.props.router.asPath) {
            return null;
        }

        const fullPageLayoutRoutes = [
            PagePaths.login(),
            PagePaths.lock()
        ];
        let isFullPageLayout = fullPageLayoutRoutes.includes(this.props.router.pathname) || this.state.sessionData.id.length <= 0 || this.state.isAppLoading;

        const commonProps: PagePropCommonDocument = {
            router: this.props.router,
            t: this.props.t,
            setBreadCrumb: titles => this.setBreadCrumb(titles),
            setStateApp: (data, callBack) => this.setStateApp(data, callBack),
            getStateApp: this.state
        };

        return (
            <div>
                <ComponentHead title={this.state.breadCrumbTitle}/>
                <div className="container-scroller">
                    <ToastContainer />
                    {!isFullPageLayout ? <Navbar {...commonProps}/> : null}
                    <div className={`container-fluid page-body-wrapper ${isFullPageLayout ? "full-page-wrapper" : ""}`}>
                        {!isFullPageLayout ? <Sidebar {...commonProps}/> : null}
                        {this.state.isPageLoading || this.state.isAppLoading ? <Spinner isFullPage={isFullPageLayout}/> : null}
                        <ProviderAuth {...commonProps}>
                            <ProviderPermission {...commonProps}>
                                <ProviderAppInit  {...commonProps}>
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
                                </ProviderAppInit>
                            </ProviderPermission>
                        </ProviderAuth>
                    </div>
                </div>
            </div>
        );
    }
}

export function withCustomProps(Component: any) {
    function ComponentWithCustomProps(props: any) {
        let {t} = useTranslation();
        return (
            <Component
                {...props}
                t={t}
            />
        );
    }

    return ComponentWithCustomProps;
}

export default withCustomProps(AppAdmin);