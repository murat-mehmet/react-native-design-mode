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
                const parameters = {...this.parameters, ...designMeta.parameters, ...componentStub.component?.parameters};
                const loaders = {...this.loaders, ...designMeta.loaders, ...componentStub.component?.loaders};
                const decorators = [
                    ...componentStub.component?.decorators || [],
                    ...designMeta.decorators || [],
                    ...this.decorators || [],
                ];
                const subContext = {
                    loaded: this.loaded,
                    parameters,
                    loaders,
                    decorators,
                }
                let _prepare;
                if (!!Object.keys(this.loaders).length) {
                    _prepare = async (context) => {
                        for (const [name, loader] of Object.entries<(ctx: any) => Promise<any>>(loaders)) {
                            if (this.loaded[name])
                                continue;
                            try {
                                this.loaded[name] = await loader(context);
                            } catch (err) {
                                this.loaded[name] = err;
                            }
                        }
                        const componentPrepare = componentStub.component?.prepare || designMeta.prepare;
                        if (componentPrepare)
                            return componentPrepare(context);
                    }
                } else
                    _prepare = componentStub.component?.prepare || designMeta.prepare;

                let prepare;
                if (_prepare)
                    prepare = () => _prepare(subContext);

                for (const decorator of decorators) {
                    component = applyDecorator(decorator, component, subContext);
                }

                designStub.components.push({
                    title: componentStub.component?.title || componentStub.name,
                    prepare,
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
