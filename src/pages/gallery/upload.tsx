import React, {Component, createRef, RefObject} from 'react'
import {PagePropCommonDocument} from "types/pageProps";
import UploadingFilesDocument from "types/pages/gallery/upload";
import galleryService from "services/gallery.service";
import ThemeToast from "components/toast";

type PageState = {
    isDragging: boolean,
    uploadingFiles: UploadingFilesDocument[]
};

type PageProps = {
    isModal?: boolean
    uploadedImages?: (images: string[]) => void
} & PagePropCommonDocument;

class PageGalleryUpload extends Component<PageProps, PageState> {
    refInputFile: RefObject<HTMLInputElement> = createRef();
    maxFileSize: number;

    constructor(props: PageProps) {
        super(props);
        this.maxFileSize = Number(process.env.REACT_APP_UPLOAD_FILE_SIZE ?? 1024000);
        this.state = {
            isDragging: false,
            uploadingFiles: []
        }
    }

    componentDidMount() {
        this.setPageTitle()
    }

    setPageTitle() {
        this.props.setBreadCrumb([
            this.props.t("gallery"),
            this.props.t("upload")
        ])
    }

    async uploadFiles() {
        let uploadedImages: string[] = [];
        for (const [index, uploadingFile] of this.state.uploadingFiles.entries()) {
            if (
                uploadingFile.progressValue === 100
            ) continue;

            if (uploadingFile.file.size > this.maxFileSize) {
                await new Promise(resolve => {
                    this.setState((state: PageState) => {
                        state.uploadingFiles[index].progressValue = 100;
                        return state;
                    }, () => resolve(true));
                });
                new ThemeToast({
                    type: "error",
                    title: this.props.t("error"),
                    content: `${uploadingFile.file.name} ${this.props.t("bigImageSize")}`,
                    position: "top-right",
                    timeOut: 5
                })
                continue;
            }

            const formData = new FormData();
            formData.append("file", uploadingFile.file, uploadingFile.file.name);

            let resData = await galleryService.add(formData, (e, percent) => {
                console.log(e, percent)
                this.setState((state: PageState) => {
                    state.uploadingFiles[index].progressValue = percent ?? 100;
                    return state;
                })
            });

            if (
                resData.status &&
                Array.isArray(resData.data) &&
                resData.data.length > 0
            ) {
                uploadedImages.push(resData.data[0]);
                new ThemeToast({
                    type: "success",
                    title: this.props.t("successful"),
                    content: `${uploadingFile.file.name} ${this.props.t("imageUploadedWithName")}`,
                    position: "top-right",
                    timeOut: 5
                })
            }
        }
        if(this.props.uploadedImages){
            this.props.uploadedImages(uploadedImages);
        }
    }

    onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        let files = event.target.files;
        this.setState((state: PageState) => {
            if (files != null && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    state.uploadingFiles.push({
                        id: String.createId(),
                        file: file,
                        progressValue: 0
                    });
                }
            }
            state.isDragging = false;
            return state;
        }, this.uploadFiles);
    }

    onDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        this.setState({isDragging: true});
    }

    onDragEnd(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        this.setState({isDragging: false});
    }

    onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        let files = event.dataTransfer.files;
        if (files.length > 0) {
            this.setState((state: PageState) => {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    state.uploadingFiles.push({
                        id: String.createId(),
                        file: file,
                        progressValue: 0
                    });
                }
                state.isDragging = false;
                return state;
            }, this.uploadFiles);
        }
    }

    onRemoveImageInList(id: string) {
        this.setState((state: PageState) => {
            let findIndex = state.uploadingFiles.indexOfKey("id", id);
            state.uploadingFiles.remove(findIndex);
            return state;
        });
    }

    UploadingItem = (props: UploadingFilesDocument) => {
        return (
            <div
                className={`col-md-2 uploading-item bg-gradient-${(props.file.size > 1024000) ? "danger" : "secondary"}`}>
                {
                    (props.progressValue >= 100)
                        ? <div className="uploading-item-remove">
                            <span onClick={() => this.onRemoveImageInList(props.id)}>
                                <i className="mdi mdi-close"></i>
                            </span>
                        </div>
                        : <div className="uploading-item-loader">
                            <span>
                                <div className="loader-demo-box">
                                    <div className="circle-loader"></div>
                                </div>
                            </span>
                        </div>
                }
                <img className="shadow-lg mb-1" src={URL.createObjectURL(props.file)} alt={props.file.name}/>
                {
                    (props.file.size > this.maxFileSize)
                        ? <b>{this.props.t("bigImageSize")}</b>
                        : null
                }
                <div className="progress-lg progress">
                    <div role="progressbar" className="progress-bar bg-gradient-info" style={{width: `${props.progressValue}%`}}>{props.progressValue}%
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="page-gallery">
                <div className="grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="upload-container"
                                 onDragOver={(event) => this.onDragOver(event)}
                                 onDragLeave={(event) => this.onDragEnd(event)}
                                 onDrop={(event) => this.onDrop(event)}>
                                <div
                                    className={`border-container text-center ${this.state.isDragging ? `bg-gradient-dark` : ``}`}>
                                    <input
                                        type="file"
                                        ref={this.refInputFile}
                                        hidden={true}
                                        onChange={(event) => this.onChangeFile(event)}
                                        multiple={true}
                                        name="image[]"
                                        accept=".jpg,.png,.gif,.webp"
                                    />
                                    {
                                        this.state.uploadingFiles.length > 0
                                            ? (
                                                <div className="row">
                                                    {
                                                        this.state.uploadingFiles.map((file, index) =>
                                                            <this.UploadingItem {...file} key={index}/>
                                                        )
                                                    }
                                                </div>
                                            ) : (
                                                <span>
                                                    <div className="icons">
                                                      <i className="mdi mdi-image"></i>
                                                      <i className="mdi mdi-file"></i>
                                                      <i className="mdi mdi-file-cloud"></i>
                                                    </div>
                                                </span>
                                            )
                                    }
                                    <p
                                        className="cursor-pointer"
                                        onClick={() => this.refInputFile.current?.click()}>
                                        {
                                            this.props.t("dragAndDropHere")
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PageGalleryUpload;
