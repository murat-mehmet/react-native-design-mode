import React, {isValidElement} from "react";

export class DesignContext {
    designStubs = [];
    decorators = [];
    loaders = {};
    loaded = {};
    parameters = {};

    initialize() {
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

                let designTimeParameters = {...this.parameters, ...designMeta.parameters, ...componentStub.component?.parameters};
                let designComponent: Record<string, any> = {
                    title: componentStub.component?.title || componentStub.name,
                    parameters: designTimeParameters,
                };
                designComponent.prepare = async () => {
                    let runTimeParameters = {...this.parameters, ...designMeta.parameters, ...componentStub.component?.parameters};
                    const decorators = [
                        ...componentStub.component?.decorators || [],
                        ...designMeta.decorators || [],
                        ...this.decorators || [],
                    ];
                    const subContext = {
                        loaded: this.loaded,
                        parameters: runTimeParameters,
                        decorators,
                    }

                    // execute loaders
                    const loaders = {...this.loaders, ...designMeta.loaders, ...componentStub.component?.loaders};
                    for (const [name, loader] of Object.entries<(ctx: any) => Promise<any>>(loaders)) {
                        if (this.loaded[name])
                            continue;
                        try {
                            this.loaded[name] = await loader(subContext);
                        } catch (err) {
                            this.loaded[name] = err;
                        }
                    }

                    // apply decorators
                    let decoratedComponent = component;
                    if (decorators.length) {
                        for (const decorator of decorators) {
                            decoratedComponent = await applyDecorator(decorator, decoratedComponent, subContext);
                        }
                    }
                    designComponent.component = decoratedComponent;

                    // execute local prepare
                    const localPrepare = componentStub.component?.prepare || designMeta.prepare
                    if (localPrepare)
                        await localPrepare(subContext);
                }

                designStub.components.push(designComponent)
            }
            designStubs.push(designStub);
        }

        this.designStubs = designStubs;
    }
}

async function applyDecorator(decorator, component, context) {
    const decorated = await decorator(component, context);

    // <View />
    if (isValidElement(decorated))
        return () => decorated;

    // () => <View />
    // View
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
