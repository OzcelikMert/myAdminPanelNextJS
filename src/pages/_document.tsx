import React, {Component} from "react";
import {Html, Head, Main, NextScript} from 'next/document'

type PageState = {};

type PageProps = {};

export default class HTMLDocument extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
    }

    render() {
        return (
            <Html lang="en">
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}