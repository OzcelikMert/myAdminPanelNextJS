import {ReactNode} from "react";
import {ToastContainer, toast, Id, ToastOptions, ToastContent} from "react-toastify";
import React from "react";

type PageProps = {
    type?: "warning" | "error" | "success" | "info" | "loading"
    borderColor?: PageProps["type"]
    content: ReactNode | string
    title?: string
    position?: ToastOptions["position"]
    timeOut?: number
};

export default class ThemeToast {
    private toast: null | Id = null;
    private readonly options:  ToastOptions<{}>;
    private readonly content:  ToastContent<any>;
    private props: PageProps;
    public isShow: boolean;

    constructor(props: PageProps) {
        this.props = props;
        this.options = {
            position: props.position ?? "top-center",
            autoClose: props.timeOut,
            pauseOnHover: true,
            draggable: true
        }
        this.content = this.Content();
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

    private Content() {
        return (
            <div>
                <b>{this.props.title}</b><br/>
                <p>{this.props.content}</p>
            </div>
        );
    }

    private init() {
        switch (this.props.type){
            case "success":
                this.toast = toast.success(this.content, this.options)
                break;
            case "info":
                this.toast = toast.info(this.content, this.options)

                break;
            case "warning":
                this.toast = toast.warn(this.content, this.options)

                break;
            case "error":
                this.toast = toast.error(this.content, this.options)

                break;
            case "loading":
                this.toast = toast.loading(
                    this.content,
                    {
                        ...this.options,
                        autoClose: 0
                    }
                )
                break;
            default:
                this.toast = toast.info(
                    this.content,
                    {
                        ...this.options,
                        autoClose: 0,
                    }
                )
                break;
        }
    }

    hide() {
        if(this.toast && toast.isActive(this.toast)){
            this.isShow = false;
            toast.dismiss(this.toast);
        }
    }
}