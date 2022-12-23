import React, {Component} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import {ThemeFieldSet, ThemeForm, ThemeFormSelect, ThemeFormType} from "components/form";
import HandleForm from "library/react/handles/form";
import {Languages, UserRoleId} from "constants/index";
import settingService from "services/setting.service";
import languageService from "services/language.service";
import ServerInfoDocument from "types/services/serverInfo";
import serverInfoService from "services/serverInfo.service";
import Thread from "library/thread";
import Spinner from "components/tools/spinner";
import ThemeToast from "components/toast";
import ThemeChooseImage from "components/chooseImage";
import imageSourceUtil from "utils/imageSource.util";
import {SettingGeneralUpdateParamDocument} from "types/services/setting";
import {Tab, Tabs} from "react-bootstrap";
import localStorageUtil from "utils/localStorage.util";

type PageState = {
    languages: { label: string, value: string }[]
    panelLanguages: { label: string, value: string }[]
    isSubmitting: boolean
    isLoading: boolean
    serverInfo: ServerInfoDocument
    formData: Omit<SettingGeneralUpdateParamDocument, "contactForms" | "staticLanguages" | "seoContents"> & { panelLangId: string },
    formActiveKey: string
};

type PageProps = {} & PagePropCommonDocument;

export default class PageSettingsGeneral extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            languages: [],
            panelLanguages: [],
            isSubmitting: false,
            isLoading: true,
            formActiveKey: `general`,
            serverInfo: {
                cpu: "0",
                storage: "0",
                memory: "0"
            },
            formData: {
                contact: {},
                panelLangId: localStorageUtil.adminLanguage.get.toString()
            }
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getServerDetails();
        this.getPanelLanguages();
        await this.getLanguages();
        await this.getSettings();
        this.setState({
            isLoading: false
        })
    }

    setPageTitle() {
        this.props.setBreadCrumb([this.props.t("settings"), this.props.t("general")])
    }

    async getSettings() {
        let resData = await settingService.get({})
        if (resData.status) {
            this.setState((state: PageState) => {
                resData.data.forEach(setting => {
                    state.formData = {
                        ...this.state.formData,
                        logo: setting.logo,
                        logoTwo: setting.logoTwo,
                        icon: setting.icon,
                        head: setting.head,
                        script: setting.script,
                        defaultLangId: setting.defaultLangId,
                        contact: {
                            ...setting.contact
                        },
                    }
                })
                return state;
            })
        }
    }

    getPanelLanguages() {
        this.setState({
            panelLanguages: Languages.map(language => ({
                label: language.title,
                value: language.id.toString()
            }))
        })
    }

    async getLanguages() {
        let resData = await languageService.get({})
        if (resData.status) {
            this.setState({
                languages: resData.data.map(lang => ({
                    label: lang.title,
                    value: lang._id
                }))
            })
        }
    }

    async getServerDetails() {
        let resData = await serverInfoService.get();
        if (resData.status) {
            this.setState({
                serverInfo: resData.data
            })
        }
        this.setState({
            isLoading: false
        })
    }

    onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.setState({
            isSubmitting: true
        }, () => {
            settingService.updateGeneral({
                ...this.state.formData,
                head: this.state.formData.head,
                script: this.state.formData.script,
            }).then(resData => {
                if (resData.status) {
                    this.props.setPageData({
                        mainLangId: this.state.formData.defaultLangId
                    }, () => {
                        new ThemeToast({
                            type: "success",
                            title: this.props.t("successful"),
                            content: this.props.t("settingsUpdated")
                        })
                    });
                }
                this.setState((state: PageState) => {
                    state.isSubmitting = false;
                    return state;
                }, () => {
                    if (this.state.formData.panelLangId != localStorageUtil.adminLanguage.get.toString()) {
                        let language = Languages.findSingle("id", Number(this.state.formData.panelLangId));
                        if (language) {
                            localStorageUtil.adminLanguage.set(Number(this.state.formData.panelLangId));
                            window.location.reload();
                        }
                    }
                })
            })
        })
    }

    TabTools = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("head")}
                        name="head"
                        type="textarea"
                        value={this.state.formData.head}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("script")}
                        name="script"
                        type="textarea"
                        value={this.state.formData.script}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
            </div>
        );
    }

    TabSocialMedia = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title="Facebook"
                        name="contact.facebook"
                        type="url"
                        value={this.state.formData.contact?.facebook}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title="Instagram"
                        name="contact.instagram"
                        type="url"
                        value={this.state.formData.contact?.instagram}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title="Twitter"
                        name="contact.twitter"
                        type="url"
                        value={this.state.formData.contact?.twitter}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title="Linkedin"
                        name="contact.linkedin"
                        type="url"
                        value={this.state.formData.contact?.linkedin}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title="Google"
                        name="contact.google"
                        type="url"
                        value={this.state.formData.contact?.google}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
            </div>
        );
    }

    TabContact = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("email")}
                        name="contact.email"
                        type="email"
                        value={this.state.formData.contact?.email}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("phone")}
                        name="contact.phone"
                        type="tel"
                        value={this.state.formData.contact?.phone}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("address")}
                        name="contact.address"
                        type="text"
                        value={this.state.formData.contact?.address}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                ,
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("addressMap")}
                        name="contact.addressMap"
                        type="text"
                        value={this.state.formData.contact?.addressMap}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
            </div>
        );
    }

    TabGeneral = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormSelect
                        title={this.props.t("websiteMainLanguage").toCapitalizeCase()}
                        name="defaultLangId"
                        isMulti={false}
                        isSearchable={false}
                        options={this.state.languages}
                        value={this.state.languages.findSingle("value", this.state.formData.defaultLangId || "")}
                        onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item.value, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFieldSet legend={this.props.t("logo")}>
                        <ThemeChooseImage
                            {...this.props}
                            isShow={this.state["logo"]}
                            onHide={() => this.setState((state) => {
                                state["logo"] = false;
                                return state;
                            })}
                            onSelected={images => this.setState((state: PageState) => {
                                state.formData.logo = images[0];
                                return state;
                            })}
                            isMulti={false}
                        />
                        <div>
                            <img
                                src={imageSourceUtil.getUploadedImageSrc(this.state.formData.logo)}
                                alt="Empty Image"
                                className="post-image"
                            />
                            <button
                                type="button"
                                className="btn btn-gradient-warning btn-xs ms-1"
                                onClick={() => this.setState((state) => {
                                    state["logo"] = true;
                                    return state;
                                })}
                            ><i className="fa fa-pencil-square-o"></i></button>
                        </div>
                    </ThemeFieldSet>
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFieldSet legend={this.props.t("logo") + " - 2"}>
                        <ThemeChooseImage
                            {...this.props}
                            isShow={this.state["logoTwo"]}
                            onHide={() => this.setState((state) => {
                                state["logoTwo"] = false;
                                return state;
                            })}
                            onSelected={images => this.setState((state: PageState) => {
                                state.formData.logoTwo = images[0];
                                return state;
                            })}
                            isMulti={false}
                        />
                        <div>
                            <img
                                src={imageSourceUtil.getUploadedImageSrc(this.state.formData.logoTwo)}
                                alt="Empty Image"
                                className="post-image"
                            />
                            <button
                                type="button"
                                className="btn btn-gradient-warning btn-xs ms-1"
                                onClick={() => this.setState((state) => {
                                    state["logoTwo"] = true;
                                    return state;
                                })}
                            ><i className="fa fa-pencil-square-o"></i></button>
                        </div>
                    </ThemeFieldSet>
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFieldSet legend={this.props.t("icon")}>
                        <ThemeChooseImage
                            {...this.props}
                            isShow={this.state["icon"]}
                            onHide={() => this.setState((state) => {
                                state["icon"] = false;
                                return state;
                            })}
                            onSelected={images => this.setState((state: PageState) => {
                                state.formData.icon = images[0];
                                return state;
                            })}
                            isMulti={false}
                        />
                        <div>
                            <img
                                src={imageSourceUtil.getUploadedImageSrc(this.state.formData.icon)}
                                alt="Empty Image"
                                className="post-image"
                            />
                            <button
                                type="button"
                                className="btn btn-gradient-warning btn-xs ms-1"
                                onClick={() => this.setState((state) => {
                                    state["icon"] = true;
                                    return state;
                                })}
                            ><i className="fa fa-pencil-square-o"></i></button>
                        </div>
                    </ThemeFieldSet>
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormSelect
                        title={this.props.t("adminPanelLanguage").toCapitalizeCase()}
                        name="panelLangId"
                        isMulti={false}
                        isSearchable={false}
                        options={this.state.panelLanguages}
                        value={this.state.panelLanguages.findSingle("value", this.state.formData.panelLangId)}
                        onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item.value, this)}
                    />
                </div>
            </div>
        );
    }

    ServerInfo = () => {
        return (
            <div className="col-12 grid-margin">
                <div className="card card-statistics">
                    <div className="row">
                        <div className="card-col col-xl-4 col-lg-4 col-md-4 col-6">
                            <div className="card-body">
                                <div
                                    className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                                    <i className="mdi mdi-harddisk text-primary ms-0 me-sm-4 icon-lg"></i>
                                    <div className="wrapper text-center text-sm-end">
                                        <p className="card-text mb-0 text-dark">{this.props.t("storage")}</p>
                                        <div className="fluid-container">
                                            <h3 className="mb-0 font-weight-medium text-dark">{this.state.serverInfo.storage}%</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-col col-xl-4 col-lg-4 col-md-4 col-6">
                            <div className="card-body">
                                <div
                                    className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                                    <i className="mdi mdi-memory text-primary ms-0 me-sm-4 icon-lg"></i>
                                    <div className="wrapper text-center text-sm-end">
                                        <p className="card-text mb-0 text-dark">{this.props.t("memory")}</p>
                                        <div className="fluid-container">
                                            <h3 className="mb-0 font-weight-medium text-dark">{this.state.serverInfo.memory}%</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-col col-xl-4 col-lg-4 col-md-4 col-6">
                            <div className="card-body">
                                <div
                                    className="d-flex align-items-center justify-content-center flex-column flex-sm-row">
                                    <i className="fa fa-microchip text-primary ms-0 me-sm-4 icon-lg"></i>
                                    <div className="wrapper text-center text-sm-end">
                                        <p className="card-text mb-0 text-dark">{this.props.t("processor")}</p>
                                        <div className="fluid-container">
                                            <h3 className="mb-0 font-weight-medium text-dark">{this.state.serverInfo.cpu}%</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return this.state.isLoading ? <Spinner/> : (
            <div className="page-settings page-dashboard page-post">
                <this.ServerInfo/>
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
                                <div className="theme-tabs">
                                    <Tabs
                                        onSelect={(key: any) => this.setState({formActiveKey: key})}
                                        activeKey={this.state.formActiveKey}
                                        className="mb-5"
                                        transition={false}>
                                        <Tab eventKey="general" title={this.props.t("general")}>
                                            <this.TabGeneral/>
                                        </Tab>
                                        <Tab eventKey="contact" title={this.props.t("contact")}>
                                            <this.TabContact/>
                                        </Tab>
                                        <Tab eventKey="socialMedia" title={this.props.t("socialMedia")}>
                                            <this.TabSocialMedia/>
                                        </Tab>
                                        {
                                            this.props.getSessionData.roleId == UserRoleId.SuperAdmin
                                                ? <Tab eventKey="tools" title={this.props.t("tools")}>
                                                    <this.TabTools/>
                                                </Tab> : null
                                        }
                                    </Tabs>
                                </div>
                            </ThemeForm>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
