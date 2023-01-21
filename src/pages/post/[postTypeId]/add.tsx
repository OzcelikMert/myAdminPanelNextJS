import React, {Component, FormEvent} from 'react'
import {Tab, Tabs, Accordion, Card, Button} from "react-bootstrap";
import moment from "moment";
import {ThemeFieldSet, ThemeForm, ThemeFormCheckBox, ThemeFormSelect, ThemeFormType} from "components/elements/form"
import {LanguageKeysArray, PageTypes, PostTermTypeId, PostTypeId, PostTypes, StatusId} from "constants/index";
import {PagePropCommonDocument} from "types/pageProps";
import V from "library/variable";
import Variable from "library/variable";
import HandleForm from "library/react/handles/form";
import ThemeChooseImage from "components/elements/chooseImage";
import postTermService from "services/postTerm.service";
import postService from "services/post.service";
import staticContentLib from "lib/staticContent.lib";
import imageSourceLib from "lib/imageSource.lib";
import {
    PostContentButtonDocument,
    PostECommerceAttributeDocument, PostECommerceVariationDocument,
    PostUpdateParamDocument
} from "types/services/post";
import componentService from "services/component.service";
import ThemeToolTip from "components/elements/tooltip";
import Swal from "sweetalert2";
import Image from "next/image"
import dynamic from "next/dynamic";
import PostLib from "lib/post.lib";
import {ProductTypeId, ProductTypes} from "constants/productTypes";
import {AttributeTypeId, AttributeTypes} from "constants/attributeTypes";
import ThemeAccordionToggle from "components/elements/accordion/toggle";
import {variant} from "postcss-minify-font-values/types/lib/keywords";

const ThemeRichTextBox = dynamic(() => import("components/elements/richTextBox").then((module) => module.default), {ssr: false});

type PageState = {
    langKeys: { value: string, label: string }[]
    posts: { value: string, label: string }[]
    pageTypes: { value: number, label: string }[]
    attributeTypes: { value: number, label: string }[]
    productTypes: { value: number, label: string }[]
    components: { value: string, label: string }[]
    formActiveKey: string
    categoryTerms: { value: string, label: string }[]
    tagTerms: { value: string, label: string }[]
    attributes: { value: string, label: string }[],
    variations: { value: string, label: string, mainId: string }[],
    status: { value: number, label: string }[]
    isSubmitting: boolean
    mainTitle: string
    formData: Omit<PostUpdateParamDocument, "terms"> & {
        categoryTermId: string[]
        tagTermId: string[]
    },
    isSelectionImage: boolean
    isIconActive: boolean
} & { [key: string]: any };

type PageProps = {} & PagePropCommonDocument;

export default class PagePostAdd extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            formActiveKey: `general`,
            attributeTypes: [],
            productTypes: [],
            attributes: [],
            variations: [],
            posts: [],
            categoryTerms: [],
            langKeys: [],
            pageTypes: [],
            tagTerms: [],
            status: [],
            components: [],
            isSubmitting: false,
            mainTitle: "",
            formData: {
                postId: this.props.router.query.postId as string ?? "",
                typeId: Number(this.props.router.query.postTypeId ?? 1),
                categoryTermId: [],
                tagTermId: [],
                statusId: 0,
                order: 0,
                dateStart: new Date(),
                isFixed: 0,
                contents: {
                    langId: this.props.getStateApp.pageData.langId,
                    image: "",
                    title: "",
                    content: "",
                    shortContent: "",
                    url: "",
                    seoTitle: "",
                    seoContent: "",
                },
            },
            isSelectionImage: false,
            isIconActive: false
        }
    }

    async componentDidMount() {
        this.setPageTitle();
        this.getLangKeys();
        if ([PostTypeId.Navigate].includes(Number(this.state.formData.typeId))) {
            await this.getPosts();
        }
        if (![PostTypeId.Slider, PostTypeId.Service, PostTypeId.Testimonial, PostTypeId.Navigate].includes(Number(this.state.formData.typeId))) {
            await this.getTerms();
        }
        if ([PostTypeId.Page].includes(Number(this.state.formData.typeId))) {
            await this.getComponents();
            this.getPageTypes();
        }
        if ([PostTypeId.Product].includes(Number(this.state.formData.typeId))) {
            this.getAttributeTypes();
            this.getProductTypes();
            this.setState({
                formData: {
                    ...this.state.formData,
                    eCommerce: {
                        ...(this.state.formData.eCommerce ?? {typeId: ProductTypeId.SimpleProduct})
                    }
                }
            })
        }
        this.getStatus();
        if (this.state.formData.postId) {
            await this.getPost();
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
                await this.getPost()
                this.props.setStateApp({
                    isPageLoading: false
                })
            })
        }
    }

    setPageTitle() {
        let titles: string[] = [
            this.props.t(PostTypes.findSingle("id", this.state.formData.typeId)?.langKey ?? "[noLangAdd]"),
            this.props.t(this.state.formData.postId ? "edit" : "add")
        ];
        if (this.state.formData.postId) {
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

    getAttributeTypes() {
        this.setState((state: PageState) => {
            state.attributeTypes = AttributeTypes.map(attribute => ({
                label: this.props.t(attribute.langKey),
                value: attribute.id
            }))
            return state;
        })
    }

    getProductTypes() {
        this.setState((state: PageState) => {
            state.productTypes = ProductTypes.map(product => ({
                label: this.props.t(product.langKey),
                value: product.id
            }))
            return state;
        })
    }

    async getComponents() {
        let resData = await componentService.get({langId: this.props.getStateApp.pageData.mainLangId});
        if (resData.status) {
            this.setState((state: PageState) => {
                state.components = resData.data.orderBy("order", "asc").map(component => {
                    return {
                        value: component._id,
                        label: this.props.t(component.langKey)
                    };
                });
                return state;
            })
        }
    }

    getPageTypes() {
        this.setState((state: PageState) => {
            state.pageTypes = PageTypes.map(pageType => ({
                label: this.props.t(pageType.langKey),
                value: pageType.id
            }))
            return state;
        })
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
            postTypeId: this.state.formData.typeId,
            langId: this.props.getStateApp.pageData.mainLangId,
            statusId: StatusId.Active
        });
        if (resData.status) {
            this.setState((state: PageState) => {
                state.categoryTerms = [];
                state.tagTerms = [];
                for (const term of resData.data.orderBy("order", "asc")) {
                    if (term.typeId == PostTermTypeId.Category) {
                        state.categoryTerms.push({
                            value: term._id,
                            label: term.contents?.title || this.props.t("[noLangAdd]")
                        });
                    } else if (term.typeId == PostTermTypeId.Tag) {
                        state.tagTerms.push({
                            value: term._id,
                            label: term.contents?.title || this.props.t("[noLangAdd]")
                        });
                    } else if (term.typeId == PostTermTypeId.Attributes) {
                        state.attributes.push({
                            value: term._id,
                            label: term.contents?.title || this.props.t("[noLangAdd]")
                        });
                    } else if (term.typeId == PostTermTypeId.Variations) {
                        state.variations.push({
                            value: term._id,
                            label: term.contents?.title || this.props.t("[noLangAdd]"),
                            mainId: term.mainId?._id || ""
                        });
                    }
                }
                return state;
            })
        }
    }

    async getPosts() {
        let resData = await postService.get({
            langId: this.props.getStateApp.pageData.mainLangId,
            statusId: StatusId.Active,
            typeId: PostTypeId.Navigate
        });
        if (resData.status) {
            this.setState((state: PageState) => {
                state.posts = [{value: "", label: this.props.t("notSelected")}];
                resData.data.orderBy("order", "asc").forEach(item => {
                    if (!V.isEmpty(this.state.formData.postId)) {
                        if (this.state.formData.postId == item._id) return;
                    }
                    state.posts.push({
                        value: item._id,
                        label: item.contents?.title || this.props.t("[noLangAdd]")
                    });
                });
                return state;
            })
        }
    }

    async getPost() {
        let resData = await postService.get({
            postId: this.state.formData.postId,
            typeId: this.state.formData.typeId,
            langId: this.props.getStateApp.pageData.langId,
            getContents: 1
        });
        if (resData.status) {
            if (resData.data.length > 0) {
                const post = resData.data[0];

                this.setState((state: PageState) => {
                    let categoryTermId: string[] = [];
                    let tagTermId: string[] = [];

                    post.terms.forEach(term => {
                        if (term?.typeId == PostTermTypeId.Category) categoryTermId.push(term._id);
                        else if (term?.typeId == PostTermTypeId.Tag) tagTermId.push(term._id);
                    });

                    state.formData = {
                        ...state.formData,
                        ...post,
                        mainId: post.mainId?._id || "",
                        categoryTermId: categoryTermId,
                        tagTermId: tagTermId,
                        components: post.components?.map(component => component._id),
                        isFixed: post.isFixed ? 1 : 0,
                        dateStart: new Date(post.dateStart),
                        contents: {
                            ...state.formData.contents,
                            ...post.contents,
                            views: post.contents?.views ?? 0,
                            langId: this.props.getStateApp.pageData.langId,
                            content: post.contents?.content ?? ""
                        }
                    };

                    if (this.props.getStateApp.pageData.langId == this.props.getStateApp.pageData.mainLangId) {
                        state.mainTitle = state.formData.contents.title;
                    }

                    state.isIconActive = Boolean(post.contents && post.contents.icon && post.contents.icon.length > 0);

                    return state;
                }, () => {
                    this.setPageTitle();
                })
            }
        } else {
            this.navigateTermPage();
        }
    }

    navigateTermPage() {
        let postTypeId = this.state.formData.typeId;
        let pagePath = PostLib.getPagePath(postTypeId);
        let path = pagePath.list();
        this.props.router.push(path);
    }

    onSubmit(event: FormEvent) {
        event.preventDefault();
        console.log(this.state);
        return false;
        this.setState({
            isSubmitting: true
        }, () => {
            let params = {
                ...this.state.formData,
                terms: this.state.formData.tagTermId.concat(this.state.formData.categoryTermId),
                components: this.state.formData.components?.filter(componentId => !Variable.isEmpty(componentId)),
                contents: {
                    ...this.state.formData.contents,
                    content: this.state.formData.contents.content
                }
            };

            ((params.postId)
                ? postService.update(params)
                : postService.add(params)).then(resData => {
                this.setState((state: PageState) => {
                    state.isSubmitting = false;
                    return state;
                }, () => this.setMessage())
            });
        })
    }

    onChangeContent(newContent: string) {
        this.setState((state: PageState) => {
            state.formData.contents.content = newContent;
            return state;
        })
    }

    setMessage() {
        Swal.fire({
            title: this.props.t("successful"),
            text: `${this.props.t((V.isEmpty(this.state.formData.postId)) ? "itemAdded" : "itemEdited")}!`,
            icon: "success",
            timer: 1000,
            timerProgressBar: true,
            didClose: () => this.onCloseSuccessMessage()
        })
    }

    onCloseSuccessMessage() {
        if (!this.state.formData.postId) {
            this.navigateTermPage();
        }
    }

    get TabGeneralButtonEvents() {
        let self = this;
        return {
            onChange(key: keyof PostContentButtonDocument, value: string, index: number) {
                self.setState((state: PageState) => {
                    if (state.formData.contents.buttons) state.formData.contents.buttons[index][key] = value;
                    return state;
                })
            },
            onAddNew() {
                self.setState((state: PageState) => {
                    if (typeof state.formData.contents.buttons === "undefined") state.formData.contents.buttons = [];
                    state.formData.contents.buttons.push({
                        title: "",
                        url: ""
                    })
                    return state;
                })
            },
            onDelete(index: number) {
                self.setState((state: PageState) => {
                    if (state.formData.contents.buttons) state.formData.contents.buttons.remove(index);
                    return state;
                })
            }
        }
    }

    get TabComponentEvents() {
        let self = this;
        return {
            onChangeSelect(value: string, index: number) {
                self.setState((state: PageState) => {
                    if (state.formData.components) state.formData.components[index] = value;
                    return state;
                })
            },
            onAddNew() {
                self.setState((state: PageState) => {
                    if (typeof state.formData.components === "undefined") state.formData.components = [];
                    state.formData.components.push("")
                    return state;
                })
            },
            onDelete(index: number) {
                self.setState((state: PageState) => {
                    if (state.formData.components) state.formData.components.remove(index);
                    return state;
                })
            }
        }
    }

    get TabECommerceEvents() {
        let self = this;
        return {
            onChange(data: any, key: any, value: any) {
                self.setState((state: PageState) => {
                    console.log(data)
                    console.log(key, value)
                    data[key] = value;
                    return state;
                })
            },
            Attributes: {
                onAddNew() {
                    self.setState((state: PageState) => {
                        if (typeof state.formData.eCommerce !== "undefined") {
                            if (typeof state.formData.eCommerce.attributes === "undefined") state.formData.eCommerce.attributes = [];
                            state.formData.eCommerce.attributes.push({
                                _id: String.createId(),
                                attributeId: "",
                                typeId: AttributeTypeId.Text,
                                variations: []
                            })
                        }
                        return state;
                    })
                },
                onChangeVariations(attribute: PostECommerceAttributeDocument, values: PageState["variations"]) {
                    self.setState((state: PageState) => {
                        attribute.variations = values.map(value => value.value)
                        return state;
                    })
                },
                onDelete(index: number) {
                    self.setState((state: PageState) => {
                        if (typeof state.formData.eCommerce !== "undefined") {
                            state.formData.eCommerce.attributes?.remove(index);
                        }
                        return state;
                    })
                },
            },
            Variations: {
                onAddNew() {
                    self.setState((state: PageState) => {
                        if (typeof state.formData.eCommerce !== "undefined") {
                            if (typeof state.formData.eCommerce.variations === "undefined") state.formData.eCommerce.variations = [];
                            state.formData.eCommerce.variations.push({
                                _id: String.createId(),
                                selectedVariations: [],
                                images: [],
                                order: 0,
                                pricing: {
                                    taxIncluded: 0,
                                    compared: 0,
                                    shipping: 0,
                                    taxExcluded: 0,
                                    taxRate: 0
                                },
                                shipping: {
                                    width: 0,
                                    height: 0,
                                    depth: 0,
                                    weight: 0
                                },
                                inventory: {
                                    sku: "",
                                    quantity: 0,
                                    isManageStock: false
                                },
                                contents: {
                                    langId: self.state.formData.contents.langId,
                                }
                            })
                        }
                        return state;
                    })
                },
                onDelete(index: number) {
                    self.setState((state: PageState) => {
                        if (typeof state.formData.eCommerce !== "undefined") {
                            state.formData.eCommerce.variations?.remove(index);
                        }
                        return state;
                    })
                },
                onChangeAttributeChild(data: PostECommerceVariationDocument, attributeId: string, value: string) {
                    self.setState((state: PageState) => {
                        if (typeof state.formData.eCommerce !== "undefined") {
                            let findIndex = data.selectedVariations.indexOfKey("attributeId", attributeId);
                            if (findIndex > -1) {
                                data.selectedVariations[findIndex].variationId = value;
                            } else {
                                data.selectedVariations.push({
                                    attributeId: attributeId,
                                    variationId: value
                                })
                            }
                        }
                        return state;
                    })
                },
            }
        }
    }

    TabECommerce = {
        Pricing: () => {
            return (
                <div className="row">
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"Tax Included Price"}
                            name="formData.eCommerce.pricing.taxIncluded"
                            type="number"
                            value={this.state.formData.eCommerce?.pricing?.taxIncluded}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"Tax Excluded Price"}
                            name="formData.eCommerce.pricing.taxExcluded"
                            type="number"
                            value={this.state.formData.eCommerce?.pricing?.taxExcluded}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"Tax Rate"}
                            name="formData.eCommerce.pricing.taxRate"
                            type="number"
                            value={this.state.formData.eCommerce?.pricing?.taxRate}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"Compared Price"}
                            name="formData.eCommerce.pricing.compared"
                            type="number"
                            value={this.state.formData.eCommerce?.pricing?.compared}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                </div>
            );
        },
        Inventory: () => {
            return (
                <div className="row">
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"SKU"}
                            name="formData.eCommerce.inventory.sku"
                            type="text"
                            value={this.state.formData.eCommerce?.inventory?.sku}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"Quantity"}
                            name="formData.eCommerce.inventory.quantity"
                            type="number"
                            value={this.state.formData.eCommerce?.inventory?.quantity}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                    <div className="col-md-7">
                        <ThemeFormCheckBox
                            title={"Is Manage Stock"}
                            name="formData.eCommerce.inventory.isManageStock"
                            checked={Boolean(this.state.formData.eCommerce?.inventory?.isManageStock)}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                </div>
            );
        },
        Shipping: () => {
            return (
                <div className="row">
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"Width"}
                            name="formData.eCommerce.shipping.width"
                            type="number"
                            value={this.state.formData.eCommerce?.shipping?.width}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"Height"}
                            name="formData.eCommerce.shipping.height"
                            type="number"
                            value={this.state.formData.eCommerce?.shipping?.height}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"Depth"}
                            name="formData.eCommerce.shipping.depth"
                            type="number"
                            value={this.state.formData.eCommerce?.shipping?.depth}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                    <div className="col-md-7 mb-3">
                        <ThemeFormType
                            title={"Weight"}
                            name="formData.eCommerce.shipping.weight"
                            type="number"
                            value={this.state.formData.eCommerce?.shipping?.weight}
                            onChange={e => HandleForm.onChangeInput(e, this)}
                        />
                    </div>
                </div>
            );
        },
        Attributes: () => {
            const Attribute = (attribute: PostECommerceAttributeDocument, index: number) => {
                return (
                    <div className="col-md-12 mt-4">
                        <div className="row">
                            <div className="col-2 col-md-2 m-auto">
                                <button type="button" className="btn btn-gradient-danger btn-lg"
                                        onClick={() => this.TabECommerceEvents.Attributes.onDelete(index)}>
                                    <i className="mdi mdi-trash-can"></i></button>
                            </div>
                            <div className="col-5 col-md-10">
                                <ThemeFormSelect
                                    title={"Attribute"}
                                    options={this.state.attributes}
                                    value={this.state.attributes.findSingle("value", attribute.attributeId)}
                                    onChange={(item: any, e) => this.TabECommerceEvents.onChange(attribute, "attributeId", item.value)}
                                />
                            </div>
                            <div className="col-md-5">
                                <ThemeFormSelect
                                    title={this.props.t("type")}
                                    options={this.state.attributeTypes}
                                    value={this.state.attributeTypes?.findSingle("value", attribute.typeId)}
                                    onChange={(item: any, e) => this.TabECommerceEvents.onChange(attribute, "typeId", item.value)}
                                />
                            </div>
                            <div className="col-md-12 mb-3">
                                <ThemeFormSelect
                                    title={"Variations"}
                                    isMulti
                                    closeMenuOnSelect={false}
                                    options={this.state.variations.findMulti("mainId", attribute.attributeId)}
                                    value={this.state.variations.findMulti("value", attribute.variations)}
                                    onChange={(item: any, e) => this.TabECommerceEvents.Attributes.onChangeVariations(attribute, item)}
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            return (
                <div className="row mb-3">
                    <div className="col-md-7">
                        <button type={"button"} className="btn btn-gradient-success btn-lg"
                                onClick={() => this.TabECommerceEvents.Attributes.onAddNew()}>+ {this.props.t("addNew")}
                        </button>
                    </div>
                    <div className="col-md-7 mt-2">
                        <div className="row">
                            {
                                this.state.formData.eCommerce?.attributes?.map((option, index) => {
                                    return Attribute(option, index)
                                })
                            }
                        </div>
                    </div>
                </div>
            );
        },
        Variations: () => {
            const Variation = (variation: PostECommerceVariationDocument, index: number) => {
                return (
                    <Card>
                        <Card.Header>
                            <ThemeAccordionToggle eventKey="0">
                                <div className="row">
                                    <div className="col-9">
                                        <div className="row">
                                            {
                                                this.state.formData.eCommerce?.attributes?.map(attribute => (
                                                    <div className="col-md-4">
                                                        <ThemeFormSelect
                                                            title={this.state.attributes.findSingle("value", attribute.attributeId)?.label}
                                                            options={this.state.variations.findMulti("mainId", attribute.attributeId)}
                                                            value={this.state.variations.findSingle("value", variation.selectedVariations.findSingle("attributeId", attribute.attributeId)?.variationId)}
                                                            onChange={(item: any, e) => this.TabECommerceEvents.Variations.onChangeAttributeChild(variation, attribute.attributeId, item.value)}
                                                        />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <div className="col-3 text-end m-auto">
                                        <button type="button" className="btn btn-gradient-danger btn-lg"
                                                onClick={() => this.TabECommerceEvents.Variations.onDelete(index)}>
                                            <i className="mdi mdi-trash-can"></i></button>
                                    </div>
                                </div>
                            </ThemeAccordionToggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <div className="theme-tabs">
                                    <Tabs
                                        onSelect={(key: any) => this.TabECommerceEvents.onChange(this.state, `activeKey${variation._id}`, key)}
                                        activeKey={this.state[`activeKey${variation._id}`] || "general"}
                                        className="mb-5"
                                        transition={false}>
                                        <Tab eventKey="general" title={this.props.t("general")}>
                                            <div className="row mb-4">
                                                <div className="col-md-7 mb-3">
                                                    <ThemeChooseImage
                                                        {...this.props}
                                                        isShow={this.state[`selectImage${variation._id}`]}
                                                        onHide={() => this.setState((state: PageState) => {state[`selectImage${variation._id}`] = false; return state;})}
                                                        onSelected={images => this.setState((state: PageState) => {
                                                            if(variation.contents){
                                                                variation.contents.image = images[0];
                                                            }
                                                            state[`selectImage${variation._id}`] = false;
                                                            return state;
                                                        })}
                                                        isMulti={false}
                                                        selectedImages={(variation.contents && variation.contents.image) ? [variation.contents.image] : undefined}
                                                    />
                                                    <Image
                                                        src={imageSourceLib.getUploadedImageSrc(variation.contents?.image)}
                                                        alt="Empty Image"
                                                        className="post-image img-fluid"
                                                        width={100}
                                                        height={100}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-gradient-warning btn-xs ms-1"
                                                        onClick={() => this.TabECommerceEvents.onChange(this.state, `selectImage${variation._id}`, true)}
                                                    ><i className="fa fa-pencil-square-o"></i></button>
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <ThemeFormType
                                                        title={this.props.t("shortContent").toCapitalizeCase()}
                                                        type="textarea"
                                                        value={variation.contents?.shortContent}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.contents, "shortContent", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey="content" title={this.props.t("content")}>
                                            <div className="row mb-4">
                                                <div className="col-md-12 mb-3">
                                                    <ThemeRichTextBox
                                                        value={variation.contents?.content || ""}
                                                        onChange={newContent => this.TabECommerceEvents.onChange(variation.contents, "content", newContent)}
                                                        {...this.props}
                                                    />
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey="gallery" title={this.props.t("gallery")}>
                                            <div className="row mb-4">
                                                <div className="col-md-7 mb-3">
                                                    <ThemeChooseImage
                                                        {...this.props}
                                                        isShow={this.state[`selectGallery${variation._id}`]}
                                                        onHide={() => this.setState((state: PageState) => {state[`selectGallery${variation._id}`] = false; return state;})}
                                                        onSelected={images => this.setState((state: PageState) => {
                                                            variation.images = images;
                                                            return state
                                                        })}
                                                        isMulti={true}
                                                        selectedImages={variation.images}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-gradient-info btn-lg ms-1"
                                                        onClick={() => this.TabECommerceEvents.onChange(this.state, `selectGallery${variation._id}`, true)}
                                                    ><i className="fa fa-pencil-square-o"></i> Resim Sec</button>
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <div className="row">
                                                        {
                                                            variation.images.map(image => (
                                                                <div className="col-md-3 mb-3">
                                                                    <Image
                                                                        src={imageSourceLib.getUploadedImageSrc(image)}
                                                                        alt="Empty Image"
                                                                        className="post-image img-fluid"
                                                                        width={100}
                                                                        height={100}
                                                                    />
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey="pricing" title={"Pricing"}>
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        title={"Tax Included Price"}
                                                        type="number"
                                                        value={variation.pricing?.taxIncluded}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.pricing, "taxIncluded", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        title={"Tax Excluded Price"}
                                                        type="number"
                                                        value={variation.pricing?.taxExcluded}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.pricing, "taxExcluded", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        title={"Tax Rate"}
                                                        type="number"
                                                        value={variation.pricing?.taxRate}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.pricing, "taxRate", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        title={"Compared Price"}
                                                        type="number"
                                                        value={variation.pricing?.compared}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.pricing, "compared", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey="inventory" title={"Inventory"}>
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        title={"SKU"}
                                                        type="text"
                                                        value={variation.inventory?.sku}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.inventory, "sku", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        disabled={variation.inventory?.isManageStock || false}
                                                        title={"Quantity"}
                                                        type="number"
                                                        value={variation.inventory?.quantity}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.inventory, "quantity", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-7 mb-3">
                                                    <ThemeFormCheckBox
                                                        title={"Is Manage Stock"}
                                                        checked={Boolean(variation.inventory?.isManageStock)}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.inventory, "isManageStock", e.target.checked)}
                                                    />
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey="shipping" title={"Shipping"}>
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        title={"Width"}
                                                        type="number"
                                                        value={variation.shipping?.width}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.shipping, "width", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        title={"Height"}
                                                        type="number"
                                                        value={variation.shipping?.height}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.shipping, "height", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        title={"Depth"}
                                                        type="number"
                                                        value={variation.shipping?.depth}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.shipping, "depth", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <ThemeFormType
                                                        title={"Weight"}
                                                        type="number"
                                                        value={variation.shipping?.weight}
                                                        onChange={e => this.TabECommerceEvents.onChange(variation.shipping, "weight", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </Tab>
                                    </Tabs>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                )
            }

            return (
                <div className="row mb-3">
                    <div className="col-md-7">
                        <button type={"button"} className="btn btn-gradient-success btn-lg"
                                onClick={() => this.TabECommerceEvents.Variations.onAddNew()}>+ {this.props.t("addNew")}
                        </button>
                    </div>
                    <div className="col-md-7 mt-2">
                        <Accordion flush>
                            {
                                this.state.formData.eCommerce?.variations?.map((variation, index) => {
                                    return Variation(variation, index)
                                })
                            }
                        </Accordion>
                    </div>
                </div>
            );
        }
    }

    TabComponents = () => {
        const Component = (componentId: string, index: number) => {
            return (
                <div className="col-md-12 mt-4">
                    <div className="row">
                        <div className="col-3 col-lg-1 mt-2">
                            <button type="button" className="btn btn-gradient-danger btn-lg"
                                    onClick={event => this.TabComponentEvents.onDelete(index)}><i
                                className="mdi mdi-trash-can"></i></button>
                        </div>
                        <div className="col-9 col-lg-11">
                            <ThemeFormSelect
                                title={this.props.t("component")}
                                options={this.state.components}
                                value={this.state.components?.filter(item => item.value == componentId)}
                                onChange={(item: any, e) => this.TabComponentEvents.onChangeSelect(item.value, index)}
                            />
                        </div>
                    </div>

                </div>
            )
        }

        return (
            <div className="row mb-3">
                <div className="col-md-7">
                    <button type={"button"} className="btn btn-gradient-success btn-lg"
                            onClick={() => this.TabComponentEvents.onAddNew()}>+ {this.props.t("addNew")}
                    </button>
                </div>
                <div className="col-md-7 mt-2">
                    <div className="row">
                        {
                            this.state.formData.components?.map((componentId, index) => {
                                return Component(componentId, index)
                            })
                        }
                    </div>
                </div>
            </div>
        );
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
                {
                    ![PostTypeId.Navigate].includes(Number(this.state.formData.typeId))
                        ? <div className="col-md-7 mb-3">
                            <ThemeFormType
                                title={`${this.props.t("startDate").toCapitalizeCase()}*`}
                                type="date"
                                name="formData.dateStart"
                                value={moment(this.state.formData.dateStart).format("YYYY-MM-DD")}
                                onChange={(event) => HandleForm.onChangeInput(event, this)}
                            />
                        </div> : null
                }
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
                {
                    this.state.formData.typeId == PostTypeId.Page
                        ? <div className="col-md-7">
                            <ThemeFormSelect
                                title={this.props.t("pageType")}
                                name="formData.pageTypeId"
                                options={this.state.pageTypes}
                                value={this.state.pageTypes?.findSingle("value", this.state.formData.pageTypeId || "")}
                                onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item.value, this)}
                            />
                        </div> : null
                }
                <div className="col-md-7">
                    <ThemeFormCheckBox
                        title={this.props.t("isFixed")}
                        name="formData.isFixed"
                        checked={Boolean(this.state.formData.isFixed)}
                        onChange={e => HandleForm.onChangeInput(e, this)}
                    />
                </div>
            </div>
        );
    }

    TabContent = () => {
        return (
            <div className="row">
                <div className="col-md-7 mb-3">
                    <ThemeRichTextBox
                        value={this.state.formData.contents.content || ""}
                        onChange={newContent => this.onChangeContent(newContent)}
                        {...this.props}
                    />
                </div>
            </div>
        );
    }

    TabGeneral = () => {
        const Buttons = () => {
            const Button = (propButton: PostContentButtonDocument, index: number) => {
                return (
                    <div className="col-md-12 mt-4">
                        <ThemeFieldSet
                            legend={`${this.props.t("button")}#${index + 1}`}
                            legendElement={<i className="mdi mdi-trash-can text-danger fs-3 cursor-pointer"
                                              onClick={() => this.TabGeneralButtonEvents.onDelete(index)}></i>}
                        >
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <ThemeFormType
                                        type={"text"}
                                        title={this.props.t("title")}
                                        value={propButton.title}
                                        onChange={e => this.TabGeneralButtonEvents.onChange("title", e.target.value, index)}
                                    />
                                </div>
                                <div className="col-md-6 mt-3 mt-lg-0">
                                    <ThemeFormType
                                        type={"text"}
                                        title={this.props.t("url")}
                                        value={propButton.url}
                                        onChange={e => this.TabGeneralButtonEvents.onChange("url", e.target.value, index)}
                                    />
                                </div>
                            </div>
                        </ThemeFieldSet>
                    </div>
                )
            }

            return (
                <div className="row mb-3">
                    <div className="col-md-7">
                        <button type={"button"} className="btn btn-gradient-success btn-lg"
                                onClick={() => this.TabGeneralButtonEvents.onAddNew()}>+ {this.props.t("newButton")}
                        </button>
                    </div>
                    <div className="col-md-7 mt-2">
                        <div className="row">
                            {
                                this.state.formData.contents.buttons?.map((button, index) => {
                                    return Button(button, index)
                                })
                            }
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="row">
                {
                    [PostTypeId.Service].includes(Number(this.state.formData.typeId))
                        ? <div className="col-md-7 mb-3">
                            <div className="form-switch">
                                <input
                                    checked={this.state.isIconActive}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="flexSwitchCheckDefault"
                                    onChange={(e) => this.setState({isIconActive: !this.state.isIconActive})}
                                />
                                <label className="form-check-label ms-2"
                                       htmlFor="flexSwitchCheckDefault">{this.props.t("icon")}</label>
                            </div>
                        </div> : null
                }
                {
                    [PostTypeId.Service].includes(Number(this.state.formData.typeId)) && this.state.isIconActive
                        ? <div className="col-md-7 mb-3">
                            <ThemeFormType
                                title={`${this.props.t("icon")}`}
                                name="formData.contents.icon"
                                type="text"
                                value={this.state.formData.contents.icon}
                                onChange={e => HandleForm.onChangeInput(e, this)}
                            />
                        </div> : null
                }
                {
                    ![PostTypeId.Navigate].includes(Number(this.state.formData.typeId)) && !this.state.isIconActive
                        ? <div className="col-md-7 mb-3">
                            <ThemeChooseImage
                                {...this.props}
                                isShow={this.state.isSelectionImage}
                                onHide={() => this.setState({isSelectionImage: false})}
                                onSelected={images => this.setState((state: PageState) => {
                                    state.formData.contents.image = images[0];
                                    return state
                                })}
                                isMulti={false}
                                selectedImages={(this.state.formData.contents.image) ? [this.state.formData.contents.image] : undefined}
                            />
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
                                    this.setState({isSelectionImage: true})
                                }}
                            ><i className="fa fa-pencil-square-o"></i></button>
                        </div> : null
                }
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
                    [PostTypeId.Navigate].includes(Number(this.state.formData.typeId))
                        ? <div className="col-md-7 mb-3">
                            <ThemeFormType
                                title={`${this.props.t("url")}*`}
                                name="formData.contents.url"
                                type="text"
                                required={true}
                                value={this.state.formData.contents.url}
                                onChange={e => HandleForm.onChangeInput(e, this)}
                            />
                        </div> : null
                }
                {
                    ![PostTypeId.Navigate].includes(Number(this.state.formData.typeId))
                        ? <div className="col-md-7 mb-3">
                            <ThemeFormType
                                title={this.props.t("shortContent").toCapitalizeCase()}
                                name="formData.contents.shortContent"
                                type="textarea"
                                value={this.state.formData.contents.shortContent}
                                onChange={e => HandleForm.onChangeInput(e, this)}
                            />
                        </div> : null
                }
                {
                    [PostTypeId.Navigate, PostTypeId.Product].includes(Number(this.state.formData.typeId))
                        ? <div className="col-md-7 mb-3">
                            <ThemeFormSelect
                                title={this.props.t("main")}
                                name="formData.mainId"
                                placeholder={this.props.t("chooseMain")}
                                options={this.state.posts}
                                value={this.state.posts.findSingle("value", this.state.formData.mainId || "")}
                                onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item.value, this)}
                            />
                        </div> : null
                }
                {
                    ![PostTypeId.Page, PostTypeId.Slider, PostTypeId.Service, PostTypeId.Testimonial, PostTypeId.Navigate].includes(Number(this.state.formData.typeId))
                        ? <div className="col-md-7 mb-3">
                            <ThemeFormSelect
                                title={this.props.t("category")}
                                name="formData.categoryTermId"
                                placeholder={this.props.t("chooseCategory").toCapitalizeCase()}
                                isMulti
                                closeMenuOnSelect={false}
                                options={this.state.categoryTerms}
                                value={this.state.categoryTerms?.filter(item => this.state.formData.categoryTermId.includes(item.value))}
                                onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item, this)}
                            />
                        </div> : null
                }
                {
                    ![PostTypeId.Slider, PostTypeId.Service, PostTypeId.Testimonial, PostTypeId.Navigate].includes(Number(this.state.formData.typeId))
                        ? <div className="col-md-7 mb-3">
                            <ThemeFormSelect
                                title={this.props.t("tag")}
                                name="formData.tagTermId"
                                placeholder={this.props.t("chooseTag")}
                                isMulti
                                closeMenuOnSelect={false}
                                options={this.state.tagTerms}
                                value={this.state.tagTerms?.filter(item => this.state.formData.tagTermId.includes(item.value))}
                                onChange={(item: any, e) => HandleForm.onChangeSelect(e.name, item, this)}
                            />
                        </div> : null
                }
                {
                    [PostTypeId.Slider, PostTypeId.Service].includes(Number(this.state.formData.typeId))
                        ? <div className="col-md-7 mb-3">
                            {
                                Buttons()
                            }
                        </div> : null
                }
            </div>
        );
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-post">
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
                                this.state.formData.postId && [PostTypeId.Page, PostTypeId.Blog, PostTypeId.Portfolio, PostTypeId.Service].includes(Number(this.state.formData.typeId))
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
                                        {
                                            ![PostTypeId.Slider, PostTypeId.Navigate].includes(Number(this.state.formData.typeId))
                                                ? <Tab eventKey="content" title={this.props.t("content")}>
                                                    {
                                                        (this.state.formActiveKey === "content")
                                                            ? <this.TabContent/>
                                                            : ""
                                                    }
                                                </Tab> : null
                                        }
                                        {
                                            [PostTypeId.Page].includes(Number(this.state.formData.typeId))
                                                ? <Tab eventKey="components" title={this.props.t("components")}>
                                                    <this.TabComponents/>
                                                </Tab> : null
                                        }
                                        <Tab eventKey="options" title={this.props.t("options")}>
                                            <this.TabOptions/>
                                        </Tab>
                                        {
                                            ![PostTypeId.Slider, PostTypeId.Testimonial, PostTypeId.Navigate].includes(Number(this.state.formData.typeId))
                                                ? <Tab eventKey="seo" title={this.props.t("seo")}>
                                                    <this.TabSEO/>
                                                </Tab> : null
                                        }
                                        <Tab eventKey="pricing" title={"Pricing"}>
                                            <this.TabECommerce.Pricing/>
                                        </Tab>
                                        <Tab eventKey="inventory" title={"Inventory"}>
                                            <this.TabECommerce.Inventory/>
                                        </Tab>
                                        <Tab eventKey="shipping" title={"Shipping"}>
                                            <this.TabECommerce.Shipping/>
                                        </Tab>
                                        <Tab eventKey="attributes" title={"attributes"}>
                                            <this.TabECommerce.Attributes/>
                                        </Tab>
                                        <Tab eventKey="variations" title={"variations"}>
                                            <this.TabECommerce.Variations/>
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
