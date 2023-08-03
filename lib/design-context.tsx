import React from "react";

export class DesignContext {
    designStubs = [];
    decorators = [];
    loaders = {};
    loaded = {};
    parameters = {};

    initialize(){
        this.designStubs = [];
        this.decorators = [];
        this.loaders = {};
        this.loaded = {};
        this.parameters = {};
    }

    addDecorator(decorator) {
        this.decorators.push(decorator);
    }

    addParameters(parameter) {
        this.parameters = parameter;
    }

    addLoaders(loaders) {
        this.loaders = loaders;
    }

    configure(getDesignsFn: () => any) {
        let designs = getDesignsFn();
        let designStubs = [];
        for (let design of designs) {
            const designMeta = design.default ?? design;
            let components = Object.entries<any>(design)
                .filter(([key]) => key !== 'default')
                .map(([name, component]) => ({name, component}));
            if (!components.length)
                components = [{name: 'default', component: designMeta.component}];

            let designStub = {
                title: designMeta.title,
                components: [],
            }

            for (const componentStub of components) {
                let component = getComponentFromDesign(designMeta, componentStub.component);
                const parameters = {...this.parameters, ...designMeta.parameters, ...componentStub.component?.parameters};
                const loaders = {...this.loaders, ...designMeta.loaders, ...componentStub.component?.loaders};
                let prepare;
                if (!!Object.keys(this.loaders).length) {
                    prepare = (context) => {
                        const loaderFn = Promise.all(
                            Object.entries<Function>(loaders)
                                .map(([name, loader]) => loader(this)
                                    .then(result => {
                                        this.loaded[name] = result;
                                    })
                                    .catch(err => this.loaded[name] = err)));
                        const componentPrepare = componentStub.component?.prepare || designMeta.prepare;
                        if (componentPrepare)
                            return loaderFn.then(() => componentPrepare(context));
                        return loaderFn;
                    }
                } else
                    prepare = componentStub.component?.prepare || designMeta.prepare;
                //apply local decorator
                if (designMeta.decorators?.length)
                    for (const decorator of designMeta.decorators) {
                        component = applyDecorator(decorator, component, this);
                    }

                // apply global decorators
                if (this.decorators?.length)
                    for (const decorator of this.decorators) {
                        component = applyDecorator(decorator, component, this);
                    }

                designStub.components.push({
                    title: componentStub.component?.title || componentStub.name,
                    prepare: prepare,
                    component,
                    parameters,
                })
            }
            designStubs.push(designStub);
        }

        this.designStubs = designStubs;
    }
}

function applyDecorator(decorator, component, context) {
    const decorated = decorator(component, context);
    if (typeof decorated !== "function")
        return () => decorated;

    return decorated;
}

function getComponentFromDesign(meta, DesignComponent) {
    if (typeof DesignComponent == 'function')
        return DesignComponent;

    if (DesignComponent.component)
        return DesignComponent.component;

    if (meta.component)
        return meta.component;

    throw new Error('No component found');
}

export const context = new DesignContext();
