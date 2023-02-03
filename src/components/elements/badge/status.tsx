import React, {Component} from 'react'
import {Status, StatusId} from "constants/status";
import classNameLib from "lib/className.lib";
import {PagePropCommonDocument} from "types/pageProps";

type PageState = {};

type PageProps = {
    t: PagePropCommonDocument["t"]
    statusId: StatusId
    className?: string
};

export default class ThemeBadgeStatus extends Component<PageProps, PageState> {
    render() {
        return (
            <label className={`badge badge-gradient-${classNameLib.getStatus(this.props.statusId)} text-start ${this.props.className ?? ""}`}>
                <i className={`${classNameLib.getStatusIcon(this.props.statusId)} me-2`}></i>
                {
                    this.props.t(Status.findSingle("id", this.props.statusId)?.langKey ?? "[noLangAdd]")
                }
            </label>
        )
    }
}
