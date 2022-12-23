import React, {Component} from 'react';
import {PagePropCommonDocument} from "types/pageProps";
import {LanguageId} from "constants/index";
import {Navigate} from "react-router-dom";
import Spinner from "components/tools/spinner";
import authService from "services/auth.service";
import PagePaths from "constants/pagePaths";
import {ErrorCodes} from "library/api";

type PageState = {
    isAuth: boolean
    isPageLoading: boolean
};

type PageProps = {
    isFullPage: boolean
    children: JSX.Element
} & PagePropCommonDocument;

export default class ProviderAuth extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            isAuth: false,
            isPageLoading: true
        }
    }

    componentDidMount() {
        this.onRouteChanged();
    }

    componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<PageState>) {
        if (this.props.router.pathname !== prevProps.router.pathname) {
            this.onRouteChanged();
        }
    }

    onRouteChanged() {
        this.setState({
            isPageLoading: true,
        }, async () => {
            await this.checkSession()
            this.setState({
                isPageLoading: false
            })
        });
    }

    async checkSession() {
        let isAuth = false;
        let resData = await authService.getSession({});
        if (resData.status && resData.errorCode == ErrorCodes.success) {
            if (resData.data.length > 0) {
                isAuth = true;
                let user = resData.data[0];
                this.props.setSessionData({
                    id: user._id,
                    langId: LanguageId.English,
                    roleId: user.roleId,
                    email: user.email,
                    image: user.image,
                    name: user.name,
                    permissions: user.permissions
                });
            }
        }

        await new Promise(resolve => {
            this.setState({
                    isAuth: isAuth
            },() => {
                resolve(1);
            });
        })
    }

    render() {
        return this.state.isPageLoading ? <Spinner isFullPage={this.props.isFullPage}/>
            : (
                !this.state.isAuth &&
                this.props.router.pathname !== PagePaths.login() &&
                this.props.router.pathname !== PagePaths.lock()
            )
                ? <Navigate to={PagePaths.login()}/>
                : (
                    this.state.isAuth &&
                    this.props.router.pathname === PagePaths.login() &&
                    this.props.router.pathname === PagePaths.lock()
                )
                    ? <Navigate to={PagePaths.dashboard()}/>
                    : this.props.children
    }
}