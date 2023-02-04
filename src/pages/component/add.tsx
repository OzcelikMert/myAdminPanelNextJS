import React, {Component, FormEvent} from 'react'
import {Tab, Tabs} from "react-bootstrap";
import {PagePropCommonDocument} from "types/pageProps";
import {LanguageKeysArray, ComponentInputTypeId, ComponentInputTypes, UserRoleId} from "constants/index";
import HandleForm from "library/react/handles/form";
import {ThemeFieldSet, ThemeForm, ThemeFormSelect, ThemeFormType} from "components/elements/form";
import V from "library/variable";
import {ComponentTypeDocument, ComponentUpdateParamDocument} from "types/services/component";
import componentService from "services/component.service";
import ThemeChooseImage from "components/elements/chooseImage";
import imageSourceLib from "lib/imageSource.lib";
import Swal from "sweetalert2";
import PagePaths from "constants/pagePaths";
import Image from "next/image"
import {ThemeFormSelectValueDocument} from "components/elements/form/input/select";

type PageState = {
    langKeys: ThemeFormSelectValueDocument[]
    types: ThemeFormSelectValueDocument[]
    mainTabActiveKey: string
    isSubmitting: boolean
    mainTitle: string,
    formData: ComponentUpdateParamDocument,
} & { [key: string]: any };

type PageProps = {} & PagePropCommonDocument;

export default class PageComponentAdd extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            mainTabActiveKey: "general",
            langKeys: [],
            types: [],
            isSubmitting: false,
            mainTitle: "",
            formData: {
                _id: this.props.router.query._id as string ?? "",
                order: 0,
                types: [],
                elementId: "",
                langKey: "[noLangAdd]"
            }
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        this.getLangKeys();
        this.getTypes();
        if (this.state.formData._id) {
            await this.getItem();
        }
        this.props.setStateApp({
            isPageLoading: false
        })
    }

    async componentDidUpdate(prevProps: PagePropCommonDocument) {
        if (prevProps.getStateApp.pageData.langId != this.props.getStateApp.pageData.langId) {
            this.props.setStateApp({
                isPageLoading: true
            }, async () => {
                await this.getItem()
                this.props.setStateApp({
                    isPageLoading: false
                })
            })
        }
    }

    setPageTitle() {
        let titles: string[] = [
            this.props.t("components"),
            this.props.t(this.state.formData._id ? "edit" : "add")
        ];
        if (this.state.formData._id) {
            titles.push(this.state.mainTitle)
        }
        this.props.setBreadCrumb(titles);
    }

    getLangKeys() {
        this.setState((state: PageState) => {
            state.langKeys = LanguageKeysArray.map(langKey => ({label: langKey, value: langKey}))
            return state;
        })
    }

    getTypes() {
        this.setState((state: PageState) => {
            state.types = ComponentInputTypes.map(type => ({
                label: this.props.t(type.langKey),
                value: type.id
            }))
            return state;
        })
    }

    async getItem() {
        let resData = await componentService.get({
            _id: this.state.formData._id,
            langId: this.props.getStateApp.pageData.langId,
            getContents: true
        });
        if (resData.status) {
            if (resData.data.length > 0) {
                const item = resData.data[0];
                this.setState((state: PageState) => {
                    state.formData = {
                        ...state.formData,
                        ...item,
                        types: item.types.map(type => {
                            type.contents = {
                                ...type.contents,
                                langId: this.props.getStateApp.pageData.langId
                            }
                            return type;
                        })
                    };

                    if (this.props.getStateApp.pageData.langId == this.props.getStateApp.pageData.mainLangId) {
                        state.mainTitle = this.props.t(item.langKey);
                    }

                    return state;
                }, () => {
                    this.setPageTitle();
                })
            } else {
                this.navigatePage();
            }
        }
    }

    navigatePage() {
        let path = PagePaths.component().list();
        this.props.router.push(path);
    }

    onSubmit(event: FormEvent) {
        event.preventDefault();
        this.setState({
            isSubmitting: true
        }, async () => {
            let params = this.state.formData;
            let resData = await ((params._id)
                ? componentService.update(params)
                : componentService.add(params))
            this.setState({
                isSubmitting: false
            }, () => this.setMessage())
        })
    }

    onCloseSuccessMessage() {
        this.navigatePage()
    }

    onInputChange(data: any, key: string, value: any) {
        this.setState((state: PageState) => {
            data[key] = value;
            return state;
        }, () => {
        })
    }

    onCreateType() {
        this.setState((state: PageState) => {
            state.formData.types.push({
                _id: String.createId(),
                elementId: "",
                order: state.formData.types.length,
                langKey: "[noLangAdd]",
                typeId: ComponentInputTypeId.Text,
                contents: {
                    langId: this.props.getStateApp.pageData.langId,
                    content: ""
                }
            })
            return state;
        })
    }

    async onDelete(componentTypes: ComponentTypeDocument[], index: number) {
        let result = await Swal.fire({
            title: this.props.t("deleteAction"),
            html: `<b>'${this.props.t(componentTypes[index].langKey)}'</b> ${this.props.t("deleteItemQuestionWithItemName")}`,
            confirmButtonText: this.props.t("yes"),
            cancelButtonText: this.props.t("no"),
            icon: "question",
            showCancelButton: true
        });
        if (result.isConfirmed) {
            this.setState((state: PageState) => {
                componentTypes.splice(index, 1);
                return state;
            })
        }
    }

    setMessage() {
        Swal.fire({
            title: this.props.t("successful"),
            text: `${this.props.t((V.isEmpty(this.state.formData._id)) ? "itemAdded" : "itemEdited")}!`,
            icon: "success",
            timer: 1000,
            timerProgressBar: true,
            didClose: () => this.onCloseSuccessMessage()
        })
    }

    TabTypes = () => {
        const Type = (typeProps: ComponentTypeDocument, typeIndex: number) => {
            let input = <div>{this.props.t("type")}</div>;
            switch (typeProps.typeId) {
                case ComponentInputTypeId.TextArea:
                    input = <ThemeFormType
                        type={"textarea"}
                        title={this.props.t(typeProps.langKey)}
                        value={typeProps.contents?.content}
                        onChange={e => this.onInputChange(typeProps.contents, "content", e.target.value)}
                    />
                    break;
                case ComponentInputTypeId.Image:
                    input = <ThemeFieldSet
                        legend={`${this.props.t(typeProps.langKey)} ${typeProps.contents?.comment ? `(${typeProps.contents.comment})` : ""}`}
                    >
                        <ThemeChooseImage
                            {...this.props}
                            isShow={this.state[typeProps._id]}
                            onHide={() => this.setState((state: PageState) => {
                                state[typeProps._id] = false;
                                return state;
                            })}
                            onSelected={images => this.setState((state: PageState) => {
                                if (typeProps.contents) {
                                    typeProps.contents.content = images[0];
                                }
                                return state;
                            })}
                            isMulti={false}
                        />
                        <div>
                            <Image
                                src={imageSourceLib.getUploadedImageSrc(typeProps.contents?.content)}
                                alt="Empty Image"
                                className="post-image img-fluid"
                                width={100}
                                height={100}
                            />
                            <button
                                type="button"
                                className="btn btn-gradient-warning btn-xs ms-1"
                                onClick={() => this.setState((state: PageState) => {
                                    state[typeProps._id] = true;
                                    return state;
                                })}
                            ><i className="fa fa-pencil-square-o"></i> {this.props.t("select")}</button>
                        </div>
                    </ThemeFieldSet>
                    break;
                case ComponentInputTypeId.Button:
                    input = (
                        <div className="row">
                            <div className="col-md-6">
                                <ThemeFormType
                                    type={"text"}
                                    title={`${this.props.t(typeProps.langKey)} ${typeProps.contents?.comment ? `(${typeProps.contents.comment})` : ""}`}
                                    value={typeProps.contents?.content}
                                    onChange={e => this.onInputChange(typeProps.contents, "content", e.target.value)}
                                />
                            </div>
                            <div className="col-md-6 mt-3 mt-lg-0">
                                <ThemeFormType
                                    type={"text"}
                                    title={this.props.t("url")}
                                    value={typeProps.contents?.url || ""}
                                    onChange={e => this.onInputChange(typeProps.contents, "url", e.target.value)}
                                />
                            </div>
                        </div>
                    )
                    break;
                case ComponentInputTypeId.Number:
                    input = <ThemeFormType
                        type={"number"}
                        title={`${this.props.t(typeProps.langKey)} ${typeProps.contents?.comment ? `(${typeProps.contents.comment})` : ""}`}
                        value={typeProps.contents?.content}
                        onChange={e => this.onInputChange(typeProps.contents, "content", e.target.value)}
                    />
                    break;
                default:
                    input = <ThemeFormType
                        type={"text"}
                        title={`${this.props.t(typeProps.langKey)} ${typeProps.contents?.comment ? `(${typeProps.contents.comment})` : ""}`}
                        value={typeProps.contents?.content}
                        onChange={e => this.onInputChange(typeProps.contents, "content", e.target.value)}
                    />
                    break;
            }

            return (
                <div className="col-md-7 mt-2">
                    <div className="row">
                        {
                            this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                                ? <div className="col-md-12">
                                    <button type={"button"} className="btn btn-gradient-danger btn-lg"
                                            onClick={() => this.onDelete(this.state.formData.types, typeIndex)}>{this.props.t("delete")}</button>
                                </div> : null
                        }
                        {
                            this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                                ? <div className="col-md-12 mt-3">
                                    <ThemeFormType
                                        title={`${this.props.t("elementId")}*`}
                                        type="text"
                                        required={true}
                                        value={typeProps.elementId}
                                        onChange={e => this.onInputChange(typeProps, "elementId", e.target.value)}
                                    />
                                </div> : null
                        }
                        {
                            this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                                ? <div className="col-md-12 mt-3">
                                    <ThemeFormSelect
                                        title={this.props.t("langKey")}
                                        placeholder={this.props.t("langKey")}
                                        options={this.state.langKeys}
                                        value={this.state.langKeys.filter(item => item.value == typeProps.langKey)}
                                        onChange={(item: any, e) => this.onInputChange(typeProps, "langKey", item.value)}
                                    />
                                </div> : null
                        }
                        {
                            this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                                ? <div className="col-md-12 mt-3">
                                    <ThemeFormSelect
                                        title={this.props.t("typeId")}
                                        placeholder={this.props.t("typeId")}
                                        options={this.state.types}
                                        value={this.state.types.filter(item => item.value == typeProps.typeId)}
                                        onChange={(item: any, e) => this.onInputChange(typeProps, "typeId", item.value)}
                                    />
                                </div> : null
                        }
                        {
                            this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                                ? <div className="col-md-12 mt-3">
                                    <ThemeFormType
                                        title={`${this.props.t("comment")}`}
                                        type="text"
                                        value={typeProps.contents?.comment}
                                        onChange={e => this.onInputChange(typeProps.contents, "comment", e.target.value)}
                                    />
                                </div> : null
                        }
                        {
                            this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                                ? <div className="col-md-12 mt-3">
                                    <ThemeFormType
                                        title={`${this.props.t("order")}*`}
                                        type="number"
                                        required={true}
                                        value={typeProps.order}
                                        onChange={e => this.onInputChange(typeProps, "order", e.target.value)}
                                    />
                                </div> : null
                        }
                        <div className="col-md-12 mt-3">
                            {input}
                        </div>
                    </div>
                    {
                        this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                            ? <hr/> : null
                    }
                </div>
            )
        }

        return (
            <div className="row mb-3">
                {
                    this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                        ? <div className="col-md-7">
                            <button type={"button"} className="btn btn-gradient-success btn-lg"
                                    onClick={() => this.onCreateType()}>+ {this.props.t("newType")}
                            </button>
                        </div> : null
                }
                <div className="col-md-7 mt-2">
                    <div className="row">
                        {
                            this.state.formData.types?.orderBy("order", "asc").map((type, index) => Type(type, index))
                        }
                    </div>
                </div>
            </div>
        );
    }

    TabGeneral = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={`${this.props.t("elementId")}*`}
                        name="formData.elementId"
                        type="text"
                        required={true}
                        value={this.state.formData.elementId}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormSelect
                        title={this.props.t("langKey")}
                        name="formData.langKey"
                        placeholder={this.props.t("langKey")}
                        options={this.state.langKeys}
                        value={this.state.langKeys?.findSingle("value", this.state.formData.langKey)}
                        onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item.value, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={`${this.props.t("order")}*`}
                        name="formData.order"
                        type="number"
                        required={true}
                        value={this.state.formData.order}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
            </div>
        );
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-post">
                <div className="navigate-buttons mb-3">
                    <button className="btn btn-gradient-dark btn-lg btn-icon-text"
                            onClick={() => this.navigatePage()}>
                        <i className="mdi mdi-arrow-left"></i> {this.props.t("returnBack")}
                    </button>
                </div>
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
                                <div className="card-body">
                                    <div className="theme-tabs">
                                        <Tabs
                                            onSelect={(key: any) => this.setState({mainTabActiveKey: key})}
                                            activeKey={this.state.mainTabActiveKey}
                                            className="mb-5"
                                            transition={false}>
                                            {
                                                this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin
                                                    ? <Tab eventKey="general" title={this.props.t("general")}>
                                                        <this.TabGeneral/>
                                                    </Tab> : null
                                            }
                                            <Tab
                                                eventKey={this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin ? "types" : "general"}
                                                title={this.props.t(this.props.getStateApp.sessionData.roleId == UserRoleId.SuperAdmin ? "content" : "general")}
                                            >
                                                <this.TabTypes/>
                                            </Tab>
                                        </Tabs>
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
