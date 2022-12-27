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
import {AppProps} from "next/app";
import ComponentHead from "components/head";
import {useTranslation} from "next-i18next";
import authService from "services/auth.service";
import {ErrorCodes} from "library/api";
import permissionUtil from "utils/permission.util";
import ThemeToast from "components/elements/toast";

type PageState = {
    contentLanguages: LanguageDocument[],
    breadCrumbTitle: string,
    isAppLoading: boolean,
    isPageLoading: boolean
} & AppAdminGetState;

type PageProps = {
    t: PagePropCommonDocument["t"]
} & AppProps

class AppAdmin extends Component<PageProps, PageState> {
    oldLocation: string;

    constructor(props: PageProps) {
        super(props);
        this.oldLocation = this.props.router.pathname;
        this.state = {
            breadCrumbTitle: "",
            contentLanguages: [],
            isAppLoading: true,
            isPageLoading: false,
            isAuth: false,
            permissionIsValid: false,
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
            isAppLoading: true
        }, async () => {
            await this.checkSession();
            if (this.state.isAuth) {
                await this.checkPermission();
                await this.getContentLanguages();
                await this.getContentMainLanguage();
            }
            this.setState({
                isAppLoading: false
            })
        })
    }

    async componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<PageState>) {
        console.log("App Index:", prevProps.router.pathname, this.props)
        if (prevProps.router.pathname !== this.props.router.pathname) {
            await this.onRouteChanged();
        }
    }

    async onRouteChanged() {
        this.setState({
            isPageLoading: true,
        }, async () => {
            await this.checkSession();
            if (this.state.isAuth) {
                await this.checkPermission();
            }
            console.log("onRouteChanged")
            this.setState({
                pageData:{
                    ...this.state.pageData,
                    langId: this.state.pageData.mainLangId
                }
            }, () => {
                console.log("wqeqwe")
                this.setState({isPageLoading: false}, () => {
                    console.log("Scrolled")
                    window.scrollTo(0, 0)
                })
            })
        })
    }

    async checkSession() {
        let isAuth = false;
        let resData = await authService.getSession({});
        if (resData.status && resData.errorCode == ErrorCodes.success) {
            if (resData.data.length > 0) {
                isAuth = true;
                let user = resData.data[0];
                this.setState({
                    sessionData: {
                        id: user._id,
                        langId: LanguageId.English,
                        roleId: user.roleId,
                        email: user.email,
                        image: user.image,
                        name: user.name,
                        permissions: user.permissions
                    }
                });
            }
        }

        await new Promise(resolve => {
            this.setState({
                isAuth: isAuth
            }, () => {
                resolve(1);
            });
        })
    }

    async checkPermission() {
        let permissionIsValid = true;
        const ignoredPaths = [
            PagePaths.login(),
            PagePaths.lock()
        ];
        if (
            !ignoredPaths.includes(this.props.router.pathname) &&
            !permissionUtil.checkPermissionPath(
                this.props.router.pathname,
                this.state.sessionData.roleId,
                this.state.sessionData.permissions
            )
        ) {
            permissionIsValid = false;
            new ThemeToast({
                type: "error",
                title: this.props.t("error"),
                content: this.props.t("noPerm"),
                position: "top-center"
            });
        }

        await new Promise(resolve => {
            this.setState({
                permissionIsValid: permissionIsValid,
            }, () => {
                resolve(1)
            });
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
            state = Object.assign(state, data);
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
        if (this.state.isAppLoading) {
            return <Spinner isFullPage={true}/>;
        }

        if (
            !this.state.isAuth &&
            this.props.router.pathname !== PagePaths.login() &&
            this.props.router.pathname !== PagePaths.lock()
        ) {
            this.props.router.push(PagePaths.login())
            return null;
        }

        if (
            this.state.isAuth &&
            this.props.router.pathname === PagePaths.login() &&
            this.props.router.pathname === PagePaths.lock()
        ) {
            this.props.router.push(PagePaths.dashboard())
            return null;
        }

        if (this.state.isAuth && !this.state.permissionIsValid) {
            this.props.router.push(PagePaths.dashboard());
            return null;
        }

        const fullPageLayoutRoutes = [
            PagePaths.login(),
            PagePaths.lock()
        ];
        let isFullPageLayout = fullPageLayoutRoutes.includes(this.props.router.pathname);

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
                    {!isFullPageLayout && this.state.isAuth ? <Navbar {...commonProps}/> : null}
                    <div
                        className={`container-fluid page-body-wrapper ${isFullPageLayout ? "full-page-wrapper" : ""}`}>
                        {!isFullPageLayout && this.state.isAuth ? <Sidebar {...commonProps}/> : null}
                        {
                            !this.state.isPageLoading
                                ? <div className="main-panel">
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
                                    {!isFullPageLayout && this.state.isAuth ? <Footer/> : ''}
                                </div> : <Spinner isFullPage={isFullPageLayout}/>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export function withCustomProps(Component: any) {
    function ComponentWithCustomProps(props: any) {
        let {t, i18n} = useTranslation();
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