import React, {Component, FormEvent} from 'react'
import {Tab, Tabs} from "react-bootstrap";
import {ThemeForm, ThemeFormSelect, ThemeFormType,} from "components/elements/form"
import {PagePropCommonDocument} from "types/pageProps";
import {PostTermTypeId, PostTermTypes, PostTypeId, PostTypes, StatusId} from "constants/index";
import V from "library/variable";
import HandleForm from "library/react/handles/form";
import ThemeChooseImage from "components/elements/chooseImage";
import postTermService from "services/postTerm.service";
import staticContentLib from "lib/staticContent.lib";
import imageSourceLib from "lib/imageSource.lib";
import {PostTermUpdateParamDocument} from "types/services/postTerm";
import ThemeToolTip from "components/elements/tooltip";
import Swal from "sweetalert2";
import Image from "next/image"
import PostLib from "lib/post.lib";

type PageState = {
    formActiveKey: string
    postTerms: { value: string, label: string }[]
    status: { value: number, label: string }[]
    isSubmitting: boolean
    mainTitle: string
    formData: PostTermUpdateParamDocument,
    isSelectionImage: boolean
};

type PageProps = {} & PagePropCommonDocument;

export default class PagePostTermAdd extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            formActiveKey: `general`,
            postTerms: [],
            status: [],
            isSubmitting: false,
            mainTitle: "",
            formData: {
                termId: this.props.router.query.termId as string ?? "",
                typeId: Number(this.props.router.query.termTypeId ?? 1),
                postTypeId: Number(this.props.router.query.postTypeId ?? 1),
                mainId: "",
                statusId: 0,
                order: 0,
                contents: {
                    langId: this.props.getStateApp.pageData.langId,
                    image: "",
                    title: "",
                    url: "",
                    seoTitle: "",
                    seoContent: "",
                }
            },
            isSelectionImage: false
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getTerms();
        this.getStatus();
        if (this.state.formData.termId) {
            await this.getTerm();
        }
        this.props.setStateApp({
            isPageLoading: false
        })
    }

    async componentDidUpdate(prevProps: Readonly<PageProps>) {
        if (prevProps.getStateApp.pageData.langId != this.props.getStateApp.pageData.langId) {
            this.props.setStateApp({
                isPageLoading: true
            }, async () => {
                await this.getTerm();
                this.props.setStateApp({
                    isPageLoading: false
                })
            })
        }
    }

    setPageTitle() {
        let titles: string[] = [
            this.props.t(PostTypes.findSingle("id", this.state.formData.postTypeId)?.langKey ?? "[noLangAdd]"),
            this.props.t(PostTermTypes.findSingle("id", this.state.formData.typeId)?.langKey ?? "[noLangAdd]"),
            this.props.t(this.state.formData.termId ? "edit" : "add")
        ];
        if (this.state.formData.termId) {
            titles.push(this.state.mainTitle)
        }
        this.props.setBreadCrumb(titles);
    }

    getStatus() {
        this.setState((state: PageState) => {
            state.status = staticContentLib.getStatusForSelect([
                StatusId.Active,
                StatusId.InProgress,
                StatusId.Pending
            ], this.props.t);
            state.formData.statusId = StatusId.Active;
            return state;
        })
    }

    async getTerms() {
        let resData = await postTermService.get({
            typeId: this.state.formData.typeId == PostTermTypeId.Variations ? PostTermTypeId.Attributes : this.state.formData.typeId,
            postTypeId: this.state.formData.postTypeId,
            langId: this.props.getStateApp.pageData.mainLangId,
            statusId: StatusId.Active
        });
        if (resData.status) {
            this.setState((state: PageState) => {
                state.postTerms = [{ value: "", label: this.props.t("notSelected") }];
                resData.data.orderBy("order", "asc").forEach(item => {
                    if (!V.isEmpty(this.state.formData.termId)) {
                        if (this.state.formData.termId == item._id) return;
                    }
                    state.postTerms.push({
                        value: item._id,
                        label: item.contents?.title || this.props.t("[noLangAdd]")
                    });
                });
                return state;
            })
        }
    }

    async getTerm() {
        let resData = await postTermService.get({
            termId: this.state.formData.termId,
            typeId: this.state.formData.typeId,
            postTypeId: this.state.formData.postTypeId,
            langId: this.props.getStateApp.pageData.langId
        });
        if (resData.status) {
            if (resData.data.length > 0) {
                const term = resData.data[0];
                this.setState((state: PageState) => {
                    state.formData = {
                        ...state.formData,
                        ...term,
                        mainId: term.mainId?._id || "",
                        contents: {
                            ...state.formData.contents,
                            ...term.contents,
                            views: term.contents?.views ?? 0,
                            langId: this.props.getStateApp.pageData.langId
                        }
                    }

                    if (this.props.getStateApp.pageData.langId == this.props.getStateApp.pageData.mainLangId) {
                        state.mainTitle = state.formData.contents.title;
                    }
                    return state;
                }, () => {
                    this.setPageTitle();
                })
            } else {
                this.navigateTermPage();
            }
        }
    }

    navigateTermPage() {
        let postTypeId = this.state.formData.postTypeId;
        let postTermTypeId = this.state.formData.typeId;
        let pagePath = PostLib.getPagePath(postTypeId);
        let path = pagePath.term(postTermTypeId).list()
        this.props.router.push(path);
    }

    onSubmit(event: FormEvent) {
        event.preventDefault();
        this.setState({
            isSubmitting: true
        }, () => {
            let params = this.state.formData;
            ((params.termId)
                ? postTermService.update(params)
                : postTermService.add(params)).then(async resData => {
                    if (this.state.formData.typeId == PostTermTypeId.Category && resData.status) {
                        await this.getTerms();
                    }

                    this.setState((state: PageState) => {
                        if (resData.status) {
                            state.formData = {
                                ...state.formData,
                                mainId: "",
                                statusId: StatusId.Active,
                                order: 0,
                                contents: {
                                    langId: this.props.getStateApp.pageData.mainLangId,
                                    image: "",
                                    title: "",
                                    url: "",
                                    seoTitle: "",
                                    seoContent: "",
                                }
                            }
                        }

                        state.isSubmitting = false;
                        return state;
                    }, () => this.setMessage());
                });
        })
    }

    setMessage() {
        Swal.fire({
            title: this.props.t("successful"),
            text: `${this.props.t((V.isEmpty(this.state.formData.termId)) ? "itemAdded" : "itemEdited")}!`,
            icon: "success",
            timer: 1000,
            timerProgressBar: true,
            didClose: () => this.onCloseSuccessMessage()
        })
    }

    onCloseSuccessMessage() {
        if (this.state.formData.termId) {
            this.navigateTermPage();
        }
    }

    TabSEO = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("url")}
                        name="formData.contents.url"
                        type="text"
                        value={this.state.formData.contents.url}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("title")}
                        name="formData.contents.seoTitle"
                        type="text"
                        value={this.state.formData.contents.seoTitle}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("content")}
                        name="formData.contents.seoContent"
                        type="textarea"
                        value={this.state.formData.contents.seoContent}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
            </div>
        );
    }

    TabOptions = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormSelect
                        title={this.props.t("status")}
                        name="formData.statusId"
                        options={this.state.status}
                        value={this.state.status?.findSingle("value", this.state.formData.statusId)}
                        onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item.value, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("order")}
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

    TabGeneral = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <Image
                        src={imageSourceLib.getUploadedImageSrc(this.state.formData.contents.image)}
                        alt="Empty Image"
                        className="post-image img-fluid"
                        width={100}
                        height={100}
                    />
                    <button
                        type="button"
                        className="btn btn-gradient-warning btn-xs ms-1"
                        onClick={() => {
                            this.setState({ isSelectionImage: true })
                        }}
                    ><i className="fa fa-pencil-square-o"></i></button>
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={`${this.props.t("title")}*`}
                        name="formData.contents.title"
                        type="text"
                        required={true}
                        value={this.state.formData.contents.title}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                {
                    [PostTermTypeId.Category, PostTermTypeId.Variations, PostTermTypeId.Attributes].includes(Number(this.state.formData.typeId))
                        ? <div className="col-md-7 mb-3">
                            <ThemeFormSelect
                                title={`
                                    ${this.props.t("main")} 
                                    ${this.props.t((this.state.formData.typeId == PostTermTypeId.Category) ? "category" : "tag")}
                                `}
                                name="formData.mainId"
                                placeholder={this.props.t("chooseMainCategory")}
                                options={this.state.postTerms}
                                value={this.state.postTerms.findSingle("value", this.state.formData.mainId || "")}
                                onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item.value, this)}
                            />
                        </div> : null
                }

            </div>
        );
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-post-term">
                <ThemeChooseImage
                    {...this.props}
                    isShow={this.state.isSelectionImage}
                    onHide={() => this.setState({ isSelectionImage: false })}
                    onSelected={images => this.setState((state: PageState) => {
                        state.formData.contents.image = images[0];
                        return state
                    })}
                    isMulti={false}
                />
                <div className="row mb-3">
                    <div className="col-md-3">
                        <div className="row">
                            <div className="col-6">
                                <button className="btn btn-gradient-dark btn-lg btn-icon-text w-100"
                                    onClick={() => this.navigateTermPage()}>
                                    <i className="mdi mdi-arrow-left"></i> {this.props.t("returnBack")}
                                </button>
                            </div>
                            {
                                this.state.formData.termId && [PostTypeId.Blog, PostTypeId.Portfolio].includes(Number(this.state.formData.typeId))
                                    ? <div className="col-6">
                                        <ThemeToolTip message={this.props.t("views")}>
                                            <label className="badge badge-gradient-primary w-100 p-2 fs-6 rounded-3">
                                                <i className="mdi mdi-eye"></i> {this.state.formData.contents.views}
                                            </label>
                                        </ThemeToolTip>

                                    </div> : null
                            }
                        </div>
                    </div>
                </div>
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <ThemeForm
                                isActiveSaveButton={true}
                                saveButtonText={this.props.t("save")}
                                saveButtonLoadingText={this.props.t("loading")}
                                isSubmitting={this.state.isSubmitting}
                                formAttributes={{ onSubmit: (event) => this.onSubmit(event) }}
                            >
                                <div className="theme-tabs">
                                    <Tabs
                                        onSelect={(key: any) => this.setState({ formActiveKey: key })}
                                        activeKey={this.state.formActiveKey}
                                        className="mb-5"
                                        transition={false}>
                                        <Tab eventKey="general" title={this.props.t("general")}>
                                            <this.TabGeneral />
                                        </Tab>
                                        <Tab eventKey="options" title={this.props.t("options")}>
                                            <this.TabOptions />
                                        </Tab>
                                        <Tab eventKey="seo" title={this.props.t("seo")}>
                                            <this.TabSEO />
                                        </Tab>
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