import React, {Component, FormEvent} from 'react'
import {Tab, Tabs} from "react-bootstrap";
import {ThemeForm, ThemeFormSelect, ThemeFormType,} from "components/form"
import {PagePropCommonDocument} from "types/pageProps";
import {PostTermTypeId, PostTermTypes, PostTypeId, PostTypes, StatusId} from "constants/index";
import V from "library/variable";
import SweetAlert from "react-sweetalert2";
import HandleForm from "library/react/handles/form";
import ThemeChooseImage from "components/chooseImage";
import postTermService from "services/postTerm.service";
import Spinner from "components/tools/spinner";
import staticContentUtil from "utils/staticContent.util";
import imageSourceUtil from "utils/imageSource.util";
import {PostTermUpdateParamDocument} from "types/services/postTerm";
import PagePaths from "constants/pagePaths";
import ThemeToolTip from "components/tooltip";

type PageState = {
    formActiveKey: string
    postTerms: { value: string, label: string }[]
    status: { value: number, label: string }[]
    isSubmitting: boolean
    mainTitle: string
    formData: PostTermUpdateParamDocument,
    isSuccessMessage: boolean
    isSelectionImage: boolean
    isLoading: boolean
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
                termId: this.props.getPageData.searchParams.termId,
                postTypeId: this.props.getPageData.searchParams.postTypeId,
                typeId: this.props.getPageData.searchParams.termTypeId,
                mainId: "",
                statusId: 0,
                order: 0,
                contents: {
                    langId: this.props.getPageData.langId,
                    image: "",
                    title: "",
                    url: "",
                    seoTitle: "",
                    seoContent: "",
                }
            },
            isSuccessMessage: false,
            isSelectionImage: false,
            isLoading: true
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        await this.getTerms();
        this.getStatus();
        if (this.props.getPageData.searchParams.termId) {
            await this.getTerm();
        }
        this.setState({
            isLoading: false
        })
    }

    async componentDidUpdate(prevProps: Readonly<PageProps>) {
        if (prevProps.getPageData.langId != this.props.getPageData.langId) {
            this.setState((state: PageState) => {
                state.isLoading = true;
                return state;
            }, async () => {
                await this.getTerm();
                this.setState({
                    isLoading: false
                })
            })
        }
    }

    setPageTitle() {
        let titles: string[] = [
            this.props.t(PostTypes.findSingle("id", this.props.getPageData.searchParams.postTypeId)?.langKey ?? "[noLangAdd]"),
            this.props.t(PostTermTypes.findSingle("id", this.props.getPageData.searchParams.termTypeId)?.langKey ?? "[noLangAdd]"),
            this.props.t(this.state.formData.termId ? "edit" : "add")
        ];
        if (this.state.formData.termId) {
            titles.push(this.state.mainTitle)
        }
        this.props.setBreadCrumb(titles);
    }

    getStatus() {
        this.setState((state: PageState) => {
            state.status = staticContentUtil.getStatusForSelect([
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
            typeId: this.state.formData.typeId,
            postTypeId: this.state.formData.postTypeId,
            langId: this.props.getPageData.mainLangId,
            statusId: StatusId.Active
        });
        if (resData.status) {
            this.setState((state: PageState) => {
                state.postTerms = [{ value: "", label: this.props.t("notSelected") }];
                resData.data.orderBy("order", "asc").forEach(item => {
                    if (!V.isEmpty(this.props.getPageData.searchParams.termId)) {
                        if (this.props.getPageData.searchParams.termId == item._id) return;
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
            typeId: this.state.formData.typeId,
            postTypeId: this.state.formData.postTypeId,
            langId: this.props.getPageData.langId
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
                            langId: this.props.getPageData.langId
                        }
                    }

                    if (this.props.getPageData.langId == this.props.getPageData.mainLangId) {
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
        let postTypeId = this.props.getPageData.searchParams.postTypeId;
        let postTermTypeId = this.props.getPageData.searchParams.termTypeId;
        let pagePath = [PostTypeId.Page, PostTypeId.Navigate].includes(Number(postTypeId)) ? PagePaths.post(postTypeId).term(postTermTypeId) : PagePaths.themeContent().post(postTypeId).term(postTermTypeId);
        let path = pagePath.list()
        this.props.router.navigate(path, { replace: true });
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
                                    langId: this.props.getPageData.mainLangId,
                                    image: "",
                                    title: "",
                                    url: "",
                                    seoTitle: "",
                                    seoContent: "",
                                }
                            }
                            state.isSuccessMessage = true;
                        }

                        state.isSubmitting = false;
                        return state;
                    });
                });
        })
    }

    onCloseSuccessMessage() {
        this.setState({
            isSuccessMessage: false
        });
    }

    Messages = () => {
        return (
            <SweetAlert
                show={this.state.isSuccessMessage}
                title={this.props.t("successful")}
                text={`${this.props.t((V.isEmpty(this.props.getPageData.searchParams.termId)) ? "itemAdded" : "itemEdited")}!`}
                icon="success"
                timer={1000}
                timerProgressBar={true}
                didClose={() => this.onCloseSuccessMessage()}
            />
        )
    }

    TabSEO = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("url")}
                        name="contents.url"
                        type="text"
                        value={this.state.formData.contents.url}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("title")}
                        name="contents.seoTitle"
                        type="text"
                        value={this.state.formData.contents.seoTitle}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("content")}
                        name="contents.seoContent"
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
                        name="statusId"
                        options={this.state.status}
                        value={this.state.status?.findSingle("value", this.state.formData.statusId)}
                        onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item.value, this)}
                    />
                </div>
                <div className="col-md-7 mb-3">
                    <ThemeFormType
                        title={this.props.t("order")}
                        name="order"
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
                    <img
                        src={imageSourceUtil.getUploadedImageSrc(this.state.formData.contents.image)}
                        alt={this.state.formData.contents.title}
                        className="post-image"
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
                        name="contents.title"
                        type="text"
                        required={true}
                        value={this.state.formData.contents.title}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
                {
                    this.props.getPageData.searchParams.termTypeId == PostTermTypeId.Category
                        ? <div className="col-md-7 mb-3">
                            <ThemeFormSelect
                                title={`
                                    ${this.props.t("main")} 
                                    ${this.props.t((this.props.getPageData.searchParams.termTypeId == PostTermTypeId.Category) ? "category" : "tag")}
                                `}
                                name="mainId"
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
        return this.state.isLoading ? <Spinner /> : (
            <div className="page-post-term">
                <this.Messages />
                <ThemeChooseImage
                    {...this.props}
                    isShow={this.state.isSelectionImage}
                    onHide={() => this.setState({ isSelectionImage: false })}
                    result={this.state.formData.contents.image}
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