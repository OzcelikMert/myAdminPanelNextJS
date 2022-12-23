import {ReactNode} from "react";
import cogoToast, {CTOptions, CTReturn} from "cogo-toast";
import React from "react";

type PageProps = {
    type?: "warning" | "error" | "success" | "info" | "loading"
    borderColor?: PageProps["type"]
    content: ReactNode | string
    title?: string
    position?: CTOptions["position"]
    timeOut?: number
};

class ThemeToast {
    private toast: null | CTReturn = null;
    private readonly options: CTOptions;
    private props: PageProps;
    public isShow: boolean;

    constructor(props: PageProps) {
        this.props = props;
        this.options = {
            bar: {
                color: this.getColor
            },
            position: props.position ?? "top-center",
            hideAfter: props.timeOut,
            heading: props.title,
        }
        this.isShow = true;
        this.init();
    }

    private get getColor(): string | undefined {
        let color;

        switch (this.props.borderColor){
            case "success": color = "#1bcfb4"; break;
            case "info": color = "#198ae3"; break;
            case "warning": color = "#fed713"; break;
            case "error": color = "#fe7c96"; break;
            case "loading": color = "#d8d8d8"; break;
            default: color = undefined; break;
        }

        return color;
    }

    private init() {
        switch (this.props.type){
            case "success":
                this.toast = cogoToast.success(this.props.content, this.options)
                break;
            case "info":
                this.toast = cogoToast.info(this.props.content, this.options)

                break;
            case "warning":
                this.toast = cogoToast.warn(this.props.content, this.options)

                break;
            case "error":
                this.toast = cogoToast.error(this.props.content, this.options)

                break;
            case "loading":
                this.toast = cogoToast.loading(
                    this.props.content,
                    {
                        ...this.options,
                        hideAfter: 0
                    }
                )
                break;
            default:
                this.toast = cogoToast.info(
                    this.props.content,
                    {
                        ...this.options,
                        hideAfter: 0,
                        renderIcon: () => {
                            return <div style={{"marginLeft": "-15px"}}></div>;
                        }
                    }
                )
                break;
        }
    }

    hide() {
        if(this.toast && this.toast.hide){
            this.isShow = false;
            this.toast.hide();
        }
    }
}

export default ThemeToast