import React, {Component} from "react";
import {Dropdown} from "react-bootstrap";

type PageState = {};

type PageProps = {
    items: {label: any, value: any, className?: string}[]
    onChange: (value: any) => void
    label?: string | any
};

class ThemeTableToggleMenu extends Component<PageProps, PageState> {
    render() {
        return (
            <Dropdown align={"end"}>
                <Dropdown.Toggle className="table-toggle-menu btn-gradient-primary">
                    {
                        this.props.label ?? <i className="mdi mdi-menu"></i>
                    }
                </Dropdown.Toggle>
                <Dropdown.Menu className="table-dropdown-menu">
                    {
                        this.props.items.map((item, index) => {
                                return (
                                    <Dropdown.Item className={`${item.className ?? ""}`} onClick={(event) => this.props.onChange(item.value)} key={index}>
                                        {item.label}
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