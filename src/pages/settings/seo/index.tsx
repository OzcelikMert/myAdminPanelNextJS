import React, {Component} from 'react'
import {ThemeForm, ThemeFormTags, ThemeFormType} from "components/elements/form";
import {PagePropCommonDocument} from "types/pageProps";
import HandleForm from "library/react/handles/form";
import settingService from "services/setting.service";
import ThemeToast from "components/elements/toast";
import {SettingSeoUpdateParamDocument} from "types/services/setting";

type PageState = {
    isSubmitting: boolean
    formData: SettingSeoUpdateParamDocument
};

type PageProps = {} & PagePropCommonDocument;

class PageSettingsSEO extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            isSubmitting: false,
            formData: {
                seoContents: {
                    langId: this.props.getStateApp.pageData.mainLangId,
                    title: "",
                    content: "",
                    tags: [],
                }
            }
        }
    }

    async componentDidMount() {
        this.setPageTitle()
        await this.getSeo();
        this.props.setStateApp({
            isPageLoading: false
        })
    }

    async componentDidUpdate(prevProps: Readonly<PageProps>) {
        if (prevProps.getStateApp.pageData.langId != this.props.getStateApp.pageData.langId) {
            this.props.setStateApp({
                isPageLoading: true
            }, async () => {
                await this.getSeo()
                this.props.setStateApp({
                    isPageLoading: false
                })
            })
        }
    }

    setPageTitle() {
        this.props.setBreadCrumb([this.props.t("settings"), this.props.t("seo")])
    }

    async getSeo() {
        let resData = await settingService.get({langId: this.props.getStateApp.pageData.langId});

        if (resData.status) {
            this.setState((state: PageState) => {
                if (resData.data.length > 0) {
                    let setting = resData.data[0];
                    state.formData = {
                        seoContents: {
                            ...state.formData.seoContents,
                            ...setting.seoContents,
                            langId: this.props.getStateApp.pageData.langId
                        }
                    };
                }

                return state;
            })
        }
    }

    onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        this.setState({
            isSubmitting: true
        }, () => {
            settingService.updateSeo(this.state.formData).then(resData => {
                if (resData.status) {
                    new ThemeToast({
                        type: "success",
                        title: this.props.t("successful"),
                        content: this.props.t("seoUpdated")
                    })
                }
                this.setState((state: PageState) => {
                    state.isSubmitting = false;
                    return state;
                })
            })
        })
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-settings">
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <ThemeForm
                                isActiveSaveButton={true}
                                saveButtonText={this.props.t("save")}
                                saveButtonLoadingText={this.props.t("loading")}
                                isSubmitting={this.state.isSubmitting}
                                formAttributes={{onSubmit: (event) => this.onSubmit(event)}}
                            >
                                <div className="row">
                                    <div className="col-md-7 mb-3">
                                        <ThemeFormType
                                            title={this.props.t("websiteTitle")}
                                            type="text"
                                            name="formData.seoContents.title"
                                            required={true}
                                            maxLength={50}
                                            value={this.state.formData.seoContents.title}
                                            onChange={(event) => HandleForm.onChangeInput(event, this)}
                                        />
                                    </div>
                                    <div className="col-md-7 mb-3">
                                        <ThemeFormType
                                            title={this.props.t("websiteDescription")}
                                            type="textarea"
                                            name="formData.seoContents.content"
                                            required={true}
                                            maxLength={120}
                                            value={this.state.formData.seoContents.content}
                                            onChange={(event) => HandleForm.onChangeInput(event, this)}
                                        />
                                    </div>
                                    <div className="col-md-7 mb-3">
                                        <ThemeFormTags
                                            title={this.props.t("websiteTags")}
                                            placeHolder={this.props.t("writeAndPressEnter")}
                                            name="formData.seoContents.tags"
                                            value={this.state.formData.seoContents.tags ?? []}
                                            onChange={(value, name) => HandleForm.onChangeSelect(name, value, this)}
                                        />
                                    </div>
                                </div>
                            </ThemeForm>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PageSettingsSEO;
