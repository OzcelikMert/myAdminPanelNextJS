import React, {Component} from "react";
import {Modal} from "react-bootstrap";
import {ThemeFormType} from "../form";
import HandleForm from "library/react/handles/form";
import {PagePropCommonDocument} from "types/pageProps";

type PageState = {
    isShowInvalidUrl: boolean,
    isShowInvalidImageType: boolean
    formData: {
        url: string
    }
};

type PageProps = {
    onClose: () => void
    isShow: boolean
    onSubmit: (image: string) => void
} & PagePropCommonDocument;

class ThemeChooseImageUrl extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            isShowInvalidUrl: false,
            isShowInvalidImageType: false,
            formData: {
                url: ""
            }
        }
    }

    onSubmit() {
        this.setState({
            isShowInvalidUrl: false,
            isShowInvalidImageType: false
        })

        if(!this.state.formData.url.isUrl()){
            this.setState({
                isShowInvalidUrl: true
            })
            return;
        }else if (this.state.formData.url.match(/\.(jpeg|jpg|gif|png|webp)$/) == null) {
            this.setState({
                isShowInvalidImageType: true
            })
            return;
        }

        this.props.onSubmit(this.state.formData.url)
    }

    render() {
        return (
            <Modal
                size="lg"
                centered
                show={this.props.isShow}
                backdrop={true}
                onHide={this.props.onClose}
            >
                <Modal.Body className="m-0 p-0">
                    <div className="card">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-9 mt-1 mb-1">
                                    <ThemeFormType
                                        type="url"
                                        title={"URL"}
                                        name="url"
                                        required
                                        value={this.state.formData.url}
                                        onChange={(event) => HandleForm.onChangeInput(event, this)}
                                    />
                                    {
                                        (this.state.isShowInvalidUrl)
                                            ? <small className="text-danger">Please enter valid url!</small>
                                            : null
                                    }
                                    {
                                        (this.state.isShowInvalidImageType)
                                            ? <small className="text-danger">Please only enter jpg, gif, png or webp files!</small>
                                            : null
                                    }
                                </div>
                                <div className="col-md-3 mt-1 mb-1">
                                    <button
                                        className="btn btn-gradient-success btn-lg h-100 w-100"
                                        onClick={event => this.onSubmit()}
                                    >
                                        Okay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        )
    }
}

export default ThemeChooseImageUrl;