import React, {Component} from 'react'
import ThemeInputType from "components/elements/form/input/type";
import {PagePropCommonDocument} from "types/pageProps";
import {LanguageId, StatusId} from "constants/index";
import {ThemeForm, ThemeFormCheckBox} from "components/elements/form";
import HandleForm from "library/react/handles/form";
import authService from "services/auth.service";
import UserDocument from "types/services/user";
import PagePaths from "constants/pagePaths";

type PageState = {
    isSubmitting: boolean
    isWrong: boolean
    user?: UserDocument
    formData: {
        email: string,
        password: string,
        keepMe: 1 | 0
    }
};

type PageProps = {} & PagePropCommonDocument;

class PageLogin extends Component<PageProps, PageState> {
    constructor(prop: any) {
        super(prop);
        this.state = {
            isWrong: false,
            isSubmitting: false,
            formData: {
                email: "",
                password: "",
                keepMe: 0
            }
        }
    }

    componentDidMount() {
        this.setPageTitle();
    }

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t("login")
        ])
    }

    onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.setState({
            isWrong: false,
            isSubmitting: true
        }, () => {
            authService.login(this.state.formData).then(resData => {
                if (resData.data.length > 0) {
                    let user = resData.data[0];
                    if(resData.status){
                        this.props.setSessionData({
                            id: user._id,
                            langId: LanguageId.English,
                            roleId: user.roleId,
                            email: user.email,
                            image: user.image,
                            name: user.name,
                            permissions: user.permissions,
                        });
                        this.props.router.push(PagePaths.dashboard());
                    }else {
                        this.setState({
                            user: user
                        })
                    }
                }else {
                    this.setState({
                        isWrong: true
                    })
                }
                this.setState({
                    isSubmitting: false
                })
            });
        })
    }

    render() {
        return (
            <div className="page-login">
                <div className="d-flex align-items-stretch auth auth-img-bg h-100">
                    <div className="row flex-grow">
                        <div
                            className="col-lg-6 d-flex align-items-center justify-content-center login-half-form">
                            <div className="auth-form-transparent text-left p-3">
                                <h4 className="text-center">{this.props.t("loginPanel")}</h4>
                                <ThemeForm
                                    isSubmitting={this.state.isSubmitting}
                                    formAttributes={{onSubmit: (event) => this.onSubmit(event)}}
                                    enterToSubmit={true}
                                >
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <ThemeInputType
                                                title={this.props.t("email")}
                                                type="email"
                                                name="email"
                                                required={true}
                                                value={this.state.formData.email}
                                                onChange={e => HandleForm.onChangeInput(e, this)}
                                            />
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <ThemeInputType
                                                title={this.props.t("password")}
                                                type="password"
                                                name="password"
                                                required={true}
                                                value={this.state.formData.password}
                                                onChange={e => HandleForm.onChangeInput(e, this)}
                                            />
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <ThemeFormCheckBox
                                                name="keepMe"
                                                title={this.props.t("keepMe")}
                                                checked={Boolean(this.state.formData.keepMe)}
                                                onChange={e => HandleForm.onChangeInput(e, this)}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            {
                                                this.state.isWrong
                                                    ? <p className="fw-bold text-danger">{this.props.t("wrongEmailOrPassword")}</p>
                                                    : null
                                            }
                                            {
                                                this.state.user?.statusId == StatusId.Banned
                                                    ? <div>
                                                        <p className="fw-bold text-danger">{this.props.t("yourAccountIsBanned")}</p>
                                                        <p className="fw-bold text-danger">
                                                            {this.props.t("banDateEnd")}:
                                                            <span className="text-muted ms-1">
                                                                {new Date(this.state.user?.banDateEnd || "").toLocaleDateString()}
                                                            </span>
                                                        </p>
                                                        <p className="fw-bold text-danger">
                                                            {this.props.t("banComment")}:
                                                            <span className="text-muted ms-1">
                                                                {this.state.user?.banComment}
                                                            </span>
                                                        </p>
                                                    </div> : null
                                            }
                                            {
                                                this.state.user?.statusId == StatusId.Pending
                                                    ? <div>
                                                        <p className="fw-bold text-danger">{this.props.t("yourAccountIsPending")}</p>
                                                    </div> : null
                                            }
                                            {
                                                this.state.user?.statusId == StatusId.Disabled
                                                    ? <div>
                                                        <p className="fw-bold text-danger">{this.props.t("yourAccountIsDisabled")}</p>
                                                    </div> : null
                                            }
                                        </div>
                                        <div className="col-md-12">
                                            <button
                                                type="submit"
                                                className="btn btn-block btn-gradient-primary btn-lg font-weight-medium auth-form-btn w-100"
                                                disabled={this.state.isSubmitting}
                                            >
                                                {this.props.t("login")}
                                            </button>
                                        </div>
                                    </div>
                                </ThemeForm>
                            </div>
                        </div>
                        <div className="col-lg-6 login-half-bg d-flex flex-row">
                            <div className="brand-logo">
                                {
                                    <img src={require('images/ozcelikLogo.png')} alt="logo" />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PageLogin;