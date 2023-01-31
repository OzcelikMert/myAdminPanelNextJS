import React, {Component} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import {ThemeFieldSet, ThemeForm, ThemeFormSelect, ThemeFormType} from "components/elements/form";
import {LanguageKeysArray, UserRoleId} from "constants/index";
import settingService from "services/setting.service";
import ThemeToast from "components/elements/toast";
import {
    SettingStaticLanguageDocument, SettingStaticLanguageUpdateParamDocument
} from "types/services/setting";

type PageState = {
    isSubmitting: boolean
    langKeys: { value: string, label: string }[]
    formData: SettingStaticLanguageUpdateParamDocument,
    newItems: SettingStaticLanguageDocument[]
};

type PageProps = {} & PagePropCommonDocument;

class PageSettingsStaticLanguages extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            isSubmitting: false,
            langKeys: [],
            newItems: [],
            formData: {
                staticLanguages: []
            }
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        this.getLangKeys();
        await this.getSettings();
        this.props.setStateApp({
            isPageLoading: false
        })
    }

    async componentDidUpdate(prevProps: PagePropCommonDocument) {
        if (prevProps.getStateApp.pageData.langId != this.props.getStateApp.pageData.langId) {
            this.props.setStateApp({
                isPageLoading: true
            }, async () => {
                await this.getSettings()
                this.props.setStateApp({
                    isPageLoading: false
                })
            })
        }
    }

    setPageTitle() {
        this.props.setBreadCrumb([this.props.t("settings"), this.props.t("staticLanguages")])
    }

    getLangKeys() {
        this.setState((state: PageState) => {
            state.langKeys = LanguageKeysArray.map(langKey => ({label: langKey, value: langKey}))
            return state;
        })
    }

    async getSettings() {
        let resData = await settingService.get({langId: this.props.getStateApp.pageData.langId})
        if (resData.status) {
            this.setState((state: PageState) => {
                resData.data.forEach(setting => {
                    state.formData = {
                        staticLanguages: setting.staticLanguages?.map(staticLanguage => ({
                            ...staticLanguage,
                            contents: {
                                ...staticLanguage.contents,
                                langId: this.props.getStateApp.pageData.langId
                            }
                        })) ?? []
                    }
                })
                return state;
            })
        }
    }

    onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.setState({
            isSubmitting: true
        }, async () => {
            let resData = await settingService.updateStaticLanguage({
                staticLanguages: this.state.formData.staticLanguages
            });
            if (resData.status) {
                new ThemeToast({
                    type: "success",
                    title: this.props.t("successful"),
                    content: this.props.t("settingsUpdated")
                })
            }

            this.setState({isSubmitting: false})
        })
    }

    onInputChange(data: any, key: string, value: any) {
        this.setState((state: PageState) => {
            data[key] = value;
            return state;
        })
    }

    onCreate() {
        this.setState((state: PageState) => {
            state.newItems.push({
                _id: String.createId(),
                langKey: "[noLangAdd]",
                contents: {
                    langId: this.props.getStateApp.pageData.langId,
                    content: ""
                }
            })
            return state;
        })
    }

    onAccept(_id: string) {
        this.setState((state: PageState) => {
            let findIndex = state.newItems.indexOfKey("_id", _id);
            if (findIndex > -1) {
                if (typeof state.formData.staticLanguages === "undefined") {
                    state.formData.staticLanguages = [];
                }
                state.formData.staticLanguages.push(state.newItems[findIndex]);
                state.newItems.remove(findIndex);
            }

            return state;
        })
    }

    onDelete(data: any[], index: number) {
        this.setState((state: PageState) => {
            data.remove(index);
            return state;
        })
    }

    onEdit(data: any, index: number) {
        this.setState((state: PageState) => {
            state.newItems.push(data[index]);
            data.remove(index);
            return state;
        })
    }

    StaticLanguages = () => {
        const StaticLanguage = (staticLanguageProps: SettingStaticLanguageDocument, staticLanguageIndex: number) => {
            return (
                <div className="col-md-12 mt-4">
                    <ThemeFieldSet
                        legend={`${this.props.t("staticLanguages")} (#${staticLanguageProps.langKey})`}
                        legendElement={
                            this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                                ? <i className="mdi mdi-pencil-box text-warning fs-3 cursor-pointer"
                                     onClick={() => this.onEdit(this.state.formData.staticLanguages, staticLanguageIndex)}></i>
                                : undefined
                        }
                    >
                        <div className="row">
                            <div className="col-md-12 mt-4">
                                <ThemeFormType
                                    type="text"
                                    title={this.props.t(staticLanguageProps.langKey)}
                                    value={staticLanguageProps.contents.content}
                                    onChange={e => this.onInputChange(staticLanguageProps.contents, "content", e.target.value)}
                                />
                            </div>
                        </div>
                    </ThemeFieldSet>
                </div>
            )
        }

        const NewStaticLanguage = (staticLanguageProps: SettingStaticLanguageDocument, staticLanguageIndex: number) => {
            return (
                <div className="col-md-12 mt-3">
                    <ThemeFieldSet legend={this.props.t("newStaticLanguage")}>
                        <div className="row mt-3">
                            <div className="col-md-12">
                                <ThemeFormSelect
                                    title={`${this.props.t("key")}*`}
                                    name="formData.langKey"
                                    placeholder={this.props.t("langKey")}
                                    options={this.state.langKeys}
                                    value={this.state.langKeys?.findSingle("value", staticLanguageProps.langKey)}
                                    onChange={(item: any, e) => this.onInputChange(staticLanguageProps, "langKey", item.value)}
                                />
                            </div>
                            <div className="col-md-12 mt-3">
                                <button type={"button"} className="btn btn-gradient-success btn-lg"
                                        onClick={() => this.onAccept(staticLanguageProps._id || "")}>{this.props.t("okay")}</button>
                                <button type={"button"} className="btn btn-gradient-danger btn-lg"
                                        onClick={() => this.onDelete(this.state.newItems, staticLanguageIndex)}>{this.props.t("delete")}</button>
                            </div>
                        </div>
                    </ThemeFieldSet>
                </div>
            )
        }

        return (
            <div className="row">
                {
                    this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                        ? <div className="col-md-7">
                            <button type={"button"} className="btn btn-gradient-success btn-lg"
                                    onClick={() => this.onCreate()}>+ {this.props.t("newStaticLanguage")}
                            </button>
                        </div> : null
                }
                <div className="col-md-7 mt-2">
                    <div className="row">
                        {
                            this.state.newItems.map((newItem, index) => NewStaticLanguage(newItem, index))
                        }
                    </div>
                    <div className="row">
                        {
                            this.state.formData.staticLanguages?.map((item, index) => StaticLanguage(item, index))
                        }
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-settings page-dashboard page-post">
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
                                <this.StaticLanguages/>
                            </ThemeForm>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PageSettingsStaticLanguages;
