import React, {Component} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import Swal from "sweetalert2";
import galleryService from "services/gallery.service";
import pathUtil from "utils/path.util";
import {TableColumn} from "react-data-table-component";
import imageSourceLib from "lib/imageSource.lib";
import ThemeToast from "components/elements/toast";
import permissionLib from "lib/permission.lib";
import {PermissionId} from "constants/index";
import ThemeDataTable from "components/elements/table/dataTable";
import Image from "next/image"

type PageState = {
    images: string[]
    showingImages: string[]
    selectedImages: PageState["images"]
    selectedImageIndex: number
    searchKey: string
};

type PageProps = {
    isModal?: boolean
    isMulti?: boolean
    onSubmit?: (images: string[]) => void
    uploadedImages?: string[]
} & PagePropCommonDocument;

export default class PageGalleryList extends Component<PageProps, PageState> {
    toast: null | ThemeToast = null;
    listPage: number = 0;
    listPagePerCount: number = 10;
    constructor(props: PageProps) {
        super(props);
        this.state = {
            images: [],
            showingImages: [],
            selectedImages: [],
            selectedImageIndex: 0,
            searchKey: "",
        }
    }

    async componentDidMount() {
        this.setPageTitle()
        await this.getImages();
        this.props.setStateApp({
            isPageLoading: false
        })
    }

    componentWillUnmount() {
        this.toast?.hide();
    }

    componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<PageState>) {
        if (
            this.props.uploadedImages &&
            JSON.stringify(this.props.uploadedImages) !== JSON.stringify(prevProps.uploadedImages)
        ) {
            this.setState((state: PageState) => {
                state.images = state.images.concat(this.props.uploadedImages || []).orderBy("", "desc");
                state.images = state.images.filter((image, index) => state.images.indexOfKey("", image) === index);
                return state;
            }, () => {
                this.onSearch(this.state.searchKey);
            })
        }
    }

    async getImages() {
        let resData = await galleryService.get();

        if (resData.status) {
            if (Array.isArray(resData.data)) {
                let images = resData.data.orderBy("", "desc");
                this.setState({
                    images: images
                }, () => {
                    this.onSearch(this.state.searchKey)
                })
            }
        }
    }

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t("gallery"),
            this.props.t("list")
        ])
    }

    onSelect(images: string[]) {
        if(!this.props.isModal && !permissionLib.checkPermission(
            this.props.getStateApp.sessionData.roleId,
            this.props.getStateApp.sessionData.permissions,
            PermissionId.GalleryEdit
        )) return;

        this.setState({
            selectedImages: images
        }, () => {
            if (this.state.selectedImages.length > 0) {
                if (!this.toast || !this.toast.isShow) {
                    this.toast = new ThemeToast({
                        content: (
                            (this.props.isModal)
                                ? <button type="button" className="btn btn-gradient-success btn-icon-text w-100"
                                          onClick={() => this.onSubmit()}>
                                    <i className="mdi mdi-check btn-icon-prepend"></i> {this.props.t("okay")}
                                </button>
                                : <button type="button" className="btn btn-gradient-danger btn-icon-text w-100"
                                          onClick={() => this.onDelete()}>
                                    <i className="mdi mdi-trash-can btn-icon-prepend"></i> {this.props.t("delete")}
                                </button>
                        ),
                        borderColor: this.props.isModal ? "success" : "error",
                        position: "bottom-center"
                    })
                }
            } else {
                this.toast?.hide();
            }
        })
    }

    onDelete() {
        Swal.fire({
            title: this.props.t("deleteAction"),
            html: `${this.props.t("deleteSelectedItemsQuestion")}`,
            confirmButtonText: this.props.t("yes"),
            cancelButtonText: this.props.t("no"),
            icon: "question",
            showCancelButton: true
        }).then(result => {
            if (result.isConfirmed) {
                this.toast?.hide();
                const loadingToast = new ThemeToast({
                    title: this.props.t("loading"),
                    content: this.props.t("deleting"),
                    type: "loading"
                });

                galleryService.delete({
                    images: this.state.selectedImages
                }).then(resData => {
                    loadingToast.hide();
                    if (resData.status) {
                        this.setState((state: PageState) => {
                            state.images = state.images.filter(image => !state.selectedImages.includes(image));
                            state.selectedImages = [];
                            return state;
                        }, () => {
                            this.onSearch(this.state.searchKey);
                            new ThemeToast({
                                title: this.props.t("itemDeleted"),
                                content: this.props.t("itemDeleted"),
                                type: "success",
                                timeOut: 3
                            });
                        })
                    }
                })
            }
        })
    }

    onSubmit() {
        if (this.props.onSubmit) {
            this.toast?.hide();
            this.props.onSubmit(this.state.selectedImages);
        }
    }

    onSearch(searchKey: string) {
        this.setState({
            searchKey: searchKey,
            showingImages: this.state.images.filter(image => image.toLowerCase().search(searchKey) > -1)
        })
    }

    get getTableColumns(): TableColumn<PageState["images"][0]>[] {
        return [
            {
                name: this.props.t("image"),
                width: "105px",
                cell: row => (
                    <div className="image pt-2 pb-2">
                        <Image
                            className="img-fluid"
                            alt={row}
                            src={imageSourceLib.getUploadedImageSrc(row)}
                            width={100}
                            height={100}
                        />
                    </div>
                )
            },
            {
                name: this.props.t("title"),
                selector: row => row,
                sortable: true
            },
            {
                name: this.props.t("show"),
                width: "70px",
                button: true,
                cell: row => (
                    <a
                        className="btn btn-gradient-info btn-icon-text"
                        href={pathUtil.uploads.images + row}
                        target="_blank"
                    ><i className="mdi mdi-eye"></i></a>
                )
            }
        ];
    }

    render() {
        return this.props.getStateApp.isPageLoading ? null : (
            <div className="page-gallery">
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <ThemeDataTable
                                columns={this.getTableColumns}
                                data={this.state.showingImages}
                                onSelect={rows => this.onSelect(rows)}
                                onSearch={searchKey => this.onSearch(searchKey)}
                                selectedRows={this.state.selectedImages}
                                t={this.props.t}
                                isSelectable={true}
                                isAllSelectable={!(this.props.isModal && !this.props.isMulti)}
                                isMultiSelectable={!(this.props.isModal && !this.props.isMulti)}
                                isSearchable={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
