import React, {Component} from 'react'

type PageState = {};

type PageProps = {
    legend?: string
    legendElement?: JSX.Element
    children: JSX.Element
};

class ThemeFieldSet extends Component<PageProps, PageState> {
    render() {
        return (
            <div className="theme-input static">
                <span className="label">{this.props.legend} {this.props.legendElement}</span>
                <div className="field row d-flex m-0">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export default ThemeFieldSet;
