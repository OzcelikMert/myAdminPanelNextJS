import React, {Component} from "react";
import {Modal} from "react-bootstrap";
import ThemeChooseImageUrl from "./url";
import {PagePropCommonDocument} from "types/pageProps";
import ThemeChooseImageGallery from "./gallery";

const emptyImage = require("images/empty.png");

type PageState = {
    isShowModalUrl: boolean
    isShowModalGallery: boolean
};

type PageProps = {
    isShow: boolean
    result?: string
    onSelected: (images: string[]) => void
    isMulti?: boolean
    onHide: () => void
} & PagePropCommonDocument;

class ThemeChooseImage extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            isShowModalUrl: false,
            isShowModalGallery: false
        }
    }

    onSelected(images: string[]) {
        this.setState({
            isShowModalUrl: false,
            isShowModalGallery: false
        })
        this.props.onSelected(images)
        this.props.onHide();
    }

    ModalOption = () => (
        <Modal
            size="lg"
            centered
            show={this.props.isShow}
            backdrop={true}
            onHide={this.props.onHide}
        >
            <Modal.Body className="m-0 p-0">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6 mb-1 mt-1">
                                <button
                                    className="btn btn-gradient-dark btn-lg w-100"
                                    onClick={() => {
                                        this.setState({isShowModalUrl: true})
                                    }}
                                >
                                    Enter URL
                                </button>
                            </div>
                            <div className="col-md-6 mb-1 mt-1">
                                <button
                                    className="btn btn-gradient-primary btn-lg w-100"
                                    onClick={() => {
                                        this.setState({isShowModalGallery: true})
                                    }}
                                >
                                    Choose from Gallery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )

    render() {
        return (
            <div className="theme-choose-img">
                <this.ModalOption/>
                <ThemeChooseImageUrl
                    {...this.props}
                    isShow={this.state.isShowModalUrl}
                    onSubmit={image => this.onSelected([image])}
                    onClose={() => this.setState({isShowModalUrl: false})}
                />
                <ThemeChooseImageGallery
                    {...this.props}
                    isShow={this.state.isShowModalGallery}
                    onSubmit={images => this.onSelected(images)}
                    onClose={() => this.setState({isShowModalGallery: false})}
                />
            </div>
        )
    }
}

export default ThemeChooseImage;
export {
    emptyImage
}