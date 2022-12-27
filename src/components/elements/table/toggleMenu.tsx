import React, {Component} from "react";
import {Dropdown} from "react-bootstrap";
import {LanguageId, Status, StatusId} from "constants/index";
import classNameLib from "lib/className.lib";
import {PagePropCommonDocument} from "types/pageProps";

type PageState = {};

type PageProps = {
    status: StatusId[],
    langId: LanguageId,
    onChange: (event: React.MouseEvent<HTMLElement, MouseEvent>, statusId: number) => void
    t: PagePropCommonDocument["t"]
};

class ThemeTableToggleMenu extends Component<PageProps, PageState> {
    render() {
        return (
            <Dropdown align={"end"}>
                <Dropdown.Toggle className="table-toggle-menu btn-gradient-primary">
                    <i className="mdi mdi-menu"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="table-dropdown-menu">
                    {
                        Status.findMulti("id", this.props.status).map((item, index) => {
                                return (
                                    <Dropdown.Item onClick={(event) => this.props.onChange(event, item.id)} key={index}>
                                        <button
                                            className={`btn btn-gradient-${classNameLib.getStatusClassName(item.id)} w-100 mb-1`}>{this.props.t(item.langKey)}</button>
                                    </Dropdown.Item>
                                )
                            }
                        )
                    }
                </Dropdown.Menu>
            </Dropdown>
        )
    }
}

export default ThemeTableToggleMenu;