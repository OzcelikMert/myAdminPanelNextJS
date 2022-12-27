import React, {Component} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import Lightbox from "yet-another-react-lightbox";
import {LazyLoadImage} from 'react-lazy-load-image-component';
import Swal from "sweetalert2";
import galleryService from "services/gallery.service";
import Spinner from "components/tools/spinner";
import pathUtil from "utils/path.util";
import {TableColumn} from "react-data-table-component";
import imageSourceUtil from "utils/imageSource.util";
import ThemeToast from "components/elements/toast";
import permissionUtil from "utils/permission.util";
import {PermissionId} from "constants/index";
import ThemeDataTable from "components/elements/table/dataTable";
import ComponentHead from "components/head";

type PageState = {
    images: string[]
    showingImages: string[]
    selectedImages: PageState["images"]
    selectedImageIndex: number
    isOpenViewer: boolean
    isLoading: boolean
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
            isOpenViewer: false,
            isLoading: true,
            searchKey: "",
        }
    }

    async componentDidMount() {
        this.setPageTitle()
        await this.getImages();
        this.setState({
            isLoading: false
        })
    }

    componentWillUnmount() {
        this.toast?.hide();
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

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t("gallery"),
            this.props.t("list")
        ])
    }

    onSelect(images: string[]) {
        if(!this.props.isModal && !permissionUtil.checkPermission(
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
                        borderColor: this.props.isModal ? "success" : "error"
                    })
                }
            } else {
                this.toast?.hide();
            }
        })
    }

    onShow(image: string) {
        this.setState({
            selectedImageIndex: this.state.showingImages.indexOfKey("", image),
            isOpenViewer: true
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

    onCloseViewer() {
        this.setState({
            isOpenViewer: false
        })
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
                        <LazyLoadImage
                            className="gallery-img"
                            effect="opacity"
                            alt={row}
                            src={imageSourceUtil.getUploadedImageSrc(row)} // use normal <img> attributes as props
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
                    <button
                        className="btn btn-gradient-info btn-icon-text"
                        onClick={() => this.onShow(row)}
                    ><i className="mdi mdi-eye"></i></button>
                )
            }
        ];
    }

    ImageViewer = () => {
        let images: PageState["images"] = this.state.showingImages;
        let index = this.state.selectedImageIndex;

        if(this.props.isModal){
            images = [this.state.showingImages[this.state.selectedImageIndex]];
            index = 0;
        }

        return this.state.isOpenViewer ? (
                <Lightbox
                    index={index}
                    open={this.state.isOpenViewer}
                    close={() => this.onCloseViewer()}
                    slides={images.map(image => ({
                        src: pathUtil.uploads.images + image
                    }))}
                />
            ) : null
    }


    render() {
        return this.state.isLoading ? <Spinner/> : (
            <div className="page-gallery">
                <this.ImageViewer/>
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
                                isMultiSelectable={false}
                                isSearchable={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
