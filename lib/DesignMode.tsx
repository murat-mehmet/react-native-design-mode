import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component, ReactNode} from 'react';
import {KeyboardAvoidingView, LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {context} from "./design-context";
import {DesignModeProps} from './design-mode.types';
import {DesignPage} from './DesignPage';
import DragItem from './DragItem';
import ThemeSwitchButton from "./ThemeSwitchButton";

export class DesignMode extends Component<DesignModeProps, any> {
    state = {
        ready: false,
        prepareError: null as Error,
        shown: false,
        pages: [] as {
            title: string;
            prepare: () => Promise<any>;
            Component: ReactNode | (() => Component);
        }[],
        showPage: false,
        currentPage: 0,
        showPageSelector: false,
        search: '',
        initialOpenStates: {} as {[key: string]: boolean},
        loadedPageList: false,
    };

    initialOpenStates = {
        set: (id, isOpen) => this.setState(state => {
            state.initialOpenStates[id] = isOpen;
            AsyncStorage.setItem('designer.initialOpenStates', JSON.stringify(state.initialOpenStates)).catch(console.warn);
            return {initialOpenStates: {...state.initialOpenStates}};
        }),
        clear: () => {
            this.setState({initialOpenStates: {}});
            AsyncStorage.setItem('designer.initialOpenStates', JSON.stringify({})).catch(console.warn);
        }
    };

    componentDidMount() {
        this.load();
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            prepareError: error,
            ready: false,
        });
    }

    load = () => {
        const {children, prepare} = this.props;
        const pages = [];
        if (!(children as any)?.length)
            context.designStubs.forEach(design => {
                design.components.forEach(componentStub => {
                    const titles = componentStub.title.split('/');
                    const hasVariant = design.components.length > 1;
                    titles.splice(-1, !hasVariant ? 1 : 0, design.title);
                    pages.push({
                        title: titles.join('/'),
                        prepare: componentStub.prepare,
                        Component: () => <componentStub.component />,
                        hasVariant,
                    });
                })
            })
        else
            React.Children.forEach<DesignPage>(children as any, element => {
                if (!React.isValidElement(element)) {
                    return;
                }

                if (element.type == DesignPage) {
                    pages.push({
                        title: element.props.title,
                        prepare: element.props.prepare,
                        Component: element,
                    });
                }
            });
        let willShowPageSelector = !!pages.length;
        AsyncStorage.multiGet(['designer.shown', 'designer.initialOpenStates'])
            .then((res) => {
                let data = res.reduce((obj, x) => {
                    obj[x[0]] = x[1] && JSON.parse(x[1]);
                    return obj;
                }, {})
                const shown = data['designer.shown'] ?? true;
                const initialOpenStates = data['designer.initialOpenStates'] ?? {};
                this.setState({
                    shown,
                    initialOpenStates,
                    pages,
                    showPage: willShowPageSelector,
                    showPageSelector: willShowPageSelector,
                    prepareError: null,
                    ready: willShowPageSelector || !prepare,
                    loadedPageList: !!pages.length,
                });
                if (!pages.length)
                    console.log('[Designer] No pages were loaded, will not display floating button')
                else {
                    if (prepare) {
                        (async () => prepare())()
                            .then(() => this.setState({ready: true}))
                            .catch(e => this.setState({prepareError: e}));
                    }
                }
            })

    };

    render() {
        const {children, enabled} = this.props;
        const isEnabled = enabled == null ? __DEV__ : enabled;
        if (!this.state.loadedPageList || !isEnabled) {
            return null;
        }

        return (
            <>
                {this.state.shown && (
                    <View style={StyleSheet.absoluteFillObject}>
                        {!this.state.ready ? (
                            <>
                                {!this.state.prepareError ? (
                                    <View
                                        style={[
                                            {
                                                flex: 1,
                                                backgroundColor: 'white',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            },
                                        ]}>
                                        <Text style={{color: 'black'}}>Preparing design...</Text>
                                    </View>
                                ) : (
                                    <SafeAreaProvider>
                                        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
                                            <View style={{flex: 1}}>
                                                <ScrollView
                                                    style={{flex: 1}}
                                                    contentContainerStyle={[
                                                        {backgroundColor: 'white', padding: 15},
                                                    ]}>
                                                    <Text style={{color: 'red', fontWeight: 'bold'}}>
                                                        Error while preparing design:{'\n'}
                                                        {this.state.prepareError.message}
                                                    </Text>
                                                    <Text style={{color: 'red', marginTop: 15}}>
                                                        {this.state.prepareError.stack}
                                                    </Text>
                                                </ScrollView>
                                            </View>
                                        </SafeAreaView>
                                    </SafeAreaProvider>
                                )}
                            </>
                        ) : (
                            <>
                                {!this.state.showPage
                                    ? children
                                    : this.state.showPageSelector
                                        ? this.renderPageSelector()
                                        : this.renderCurrentPage()}
                            </>
                        )}
                    </View>
                )}
                <DragItem>
                    <KeyboardAvoidingView
                        style={styles.showButtonContainer}
                        behavior="position"
                        enabled={Platform.OS == 'ios'}>
                        <TouchableOpacity
                            style={styles.showButton}
                            onPress={() => {
                                if (!this.state.shown) {
                                    AsyncStorage.setItem('designer.shown', JSON.stringify(true))
                                        .then(() => this.load())
                                        .catch(console.warn)
                                } else if (
                                    this.state.showPage &&
                                    !this.state.showPageSelector
                                ) {
                                    if (this.state.prepareError) {
                                        this.load();
                                    } else {
                                        this.setState({showPageSelector: true});
                                    }
                                } else {
                                    this.setState({
                                        shown: false,
                                    });
                                    AsyncStorage.setItem('designer.shown', JSON.stringify(false)).catch(console.warn)
                                }
                            }}>
                            <Text style={[styles.text]}>🛠️</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </DragItem>
            </>
        );
    }

    buildTree(inputArray) {
        const root = {id: '_', children: {}};
        const search = this.state.search;
        const searchLower = search.toLowerCase();

        for (let i = 0; i < inputArray.length; i++) {
            const obj = inputArray[i];

            if (search.length > 1) {
                const titleLower = obj.title.toLowerCase();
                if (titleLower.indexOf(searchLower) == -1) {
                    continue;
                }
            }

            const {title, ...otherFields} = obj;
            otherFields.pageIndex = i;

            const titleParts = obj.title.split('/').filter(part => part.trim() !== '');
            let currentNode = root;

            for (let j = 0; j < titleParts.length; j++) {
                const part = titleParts[j];

                if (!currentNode.children[part]) {
                    currentNode.children[part] = {id: `${currentNode.id}_${part}`, title: part, children: {}};
                }

                if (search.length > 1) {
                    const partLower = part.toLowerCase();
                    if (partLower.indexOf(searchLower) > -1) {
                        currentNode.children[part]['highlight'] = true;
                    }
                }
                if (j == titleParts.length - 1) {
                    Object.assign(currentNode.children[part], otherFields);
                    if (otherFields.hasVariant) {
                        currentNode['isComponent'] = true;
                        currentNode.children[part]['isVariant'] = true
                    } else
                        currentNode.children[part]['isComponent'] = true;
                } else {
                    currentNode['isFolder'] = true;
                }
                currentNode = currentNode.children[part];
            }
        }

        return root.children;
    }

    renderPageSelectorItem = (x, pad) => {
        return (
            <TouchableOpacity
                style={{
                    paddingVertical: 15,
                    backgroundColor: x.highlight ? '#ffd' : (x.isVariant ? '#fafffe' : '#f3f4fd'),
                    paddingLeft: pad,
                    // borderWidth: 1, borderColor: 'red'
                }}
                onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

                    const page = x;
                    this.setState({
                        currentPage: page.pageIndex,
                        showPageSelector: false,
                        ready: !page.prepare,
                    });
                    if (page.prepare) {
                        (async () => page.prepare(context))()
                            .then(() => this.setState({ready: true}))
                            .catch(e => this.setState({prepareError: e}));
                    }
                }}>
                <Text style={{color: 'black'}}>{x.isVariant ? '➜  ' : '🛠  '} {x.title}</Text>
            </TouchableOpacity>
        )
    }

    renderPageSelector = () => {
        const pages = this.buildTree(this.state.pages);
        return (
            <SafeAreaProvider>
                <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
                    <View>
                        <Text
                            style={{
                                color: 'black',
                                textAlign: 'center',
                                marginVertical: 15,
                                fontWeight: 'bold',
                            }}>
                            Select a design
                        </Text>
                        <View style={[StyleSheet.absoluteFillObject,
                            {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5}]}>
                            <View />
                            {context.parameters['designer']?.themeSwitcher && (
                                <ThemeSwitchButton />
                            )}
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderTopWidth: 1,
                        borderBottomWidth: 1,
                        borderColor: '#ccc',
                        paddingHorizontal: 15,
                    }}>
                        <TextInput style={{
                            flex: 1, color: 'black',
                            ...Platform.select({
                                ios: {paddingVertical: 15}
                            })
                        }} placeholder={'search...'}
                                   value={this.state.search}
                                   onChangeText={search => {
                                       if (!search.length)
                                           this.initialOpenStates.clear();
                                       this.setState({search});
                                   }} />
                        {this.state.search ? (
                            <TouchableOpacity style={{padding: 5}} onPress={() => this.setState({search: ''})}>
                                <Text>✖</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text>🔎</Text>
                        )}
                    </View>
                    <ScrollView contentContainerStyle={{paddingBottom: 15}}>
                        {Object.values<any>(pages).map((x, i) => (
                            <View key={i} style={{
                                borderTopWidth: 1,
                                borderBottomWidth: 1,
                                borderColor: '#ccc',
                            }}>
                                <Accordion
                                    item={x}
                                    renderSelectorRow={this.renderPageSelectorItem}
                                    initialOpenState={this.state.initialOpenStates}
                                    setOpenState={this.initialOpenStates.set}
                                    searching={this.state.search.length > 1}
                                    pad={15}
                                />
                            </View>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    };

    renderCurrentPage = () => {
        const component = this.state.pages[this.state.currentPage]?.Component;
        if (typeof component == 'function')
            return component();
        return component;
    }
}

class Accordion extends Component<{item: {title, children, isComponent, highlight, id}, renderSelectorRow, pad, searching, initialOpenState, setOpenState}, any> {
    state = {
        isOpen: this.props.initialOpenState[this.props.item.id] || this.props.searching
    }

    componentDidUpdate(prevProps) {
        if (prevProps.searching != this.props.searching) {
            this.setState({isOpen: this.props.searching});
        } else if (prevProps.initialOpenState != this.props.initialOpenState) {
            this.setState({isOpen: this.props.initialOpenState[this.props.item.id]});
        }
    }

    render() {
        const children = Object.values<any>(this.props.item.children);
        if (!children.length) {
            return this.props.renderSelectorRow(this.props.item, this.props.pad);
        }
        return (
            <TouchableOpacity
                style={[{
                    // borderWidth: 1, borderColor: 'green'
                }]}
                onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

                    this.setState({isOpen: !this.state.isOpen})
                    this.props.setOpenState(this.props.item.id, !this.state.isOpen);
                }}>
                <View style={{
                    flexDirection: 'row', justifyContent: 'space-between',
                    backgroundColor: this.props.item.highlight ? '#ffd' : (this.props.item.isComponent ? '#f3f4fd' : '#f8f8f8'),
                    padding: 15,
                    paddingLeft: this.props.pad,
                }}>
                    <Text style={{color: 'black'}}>{this.props.item.isComponent ? '🛠  ' : '📁  '} {this.props.item.title}</Text>
                    <Text style={{color: 'black', fontWeight: 'bold', fontSize: 16}}>
                        {this.state.isOpen ? '-' : '+'}
                    </Text>
                </View>
                {this.state.isOpen && children.map((x, i) => (
                    <View style={{
                        borderTopWidth: 1,
                        borderColor: '#ccc',
                    }} key={i}>
                        <Accordion item={x} renderSelectorRow={this.props.renderSelectorRow}
                                   pad={this.props.pad + 15}
                                   initialOpenState={this.props.initialOpenState}
                                   setOpenState={this.props.setOpenState}
                                   searching={this.props.searching} />
                    </View>
                ))}
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    text: {
        fontFamily: Platform.OS == 'ios' ? 'Courier New' : 'monospace',
        color: 'white',
        fontSize: 22
    },
    showButtonContainer: {
        height: 60,
        width: 60,
    },
    showButton: {
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        borderWidth: 10,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
