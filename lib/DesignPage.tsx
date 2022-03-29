import React, {Component} from 'react';
import {DesignPageProps} from "./design-mode.types";

export class DesignPage extends Component<DesignPageProps> {
    render() {
        return this.props.children;
    }
}
