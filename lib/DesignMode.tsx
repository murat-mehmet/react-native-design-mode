import React, {Component, ReactNode} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DesignModeProps} from './design-mode.types';
import {DesignPage} from './DesignPage';
import DragItem from './DragItem';

export class DesignMode extends Component<DesignModeProps> {
  state = {
    ready: false,
    prepareError: null as Error,
    shown: true,
    pages: [] as {
      title: string;
      prepare: () => Promise<any>;
      Component: ReactNode;
    }[],
    showPage: false,
    currentPage: 0,
    showPageSelector: false,
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
    React.Children.forEach(children, element => {
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
    this.setState({
      shown: true,
      pages,
      showPage: willShowPageSelector,
      showPageSelector: willShowPageSelector,
      prepareError: null,
      ready: willShowPageSelector || !prepare,
    });
    if (prepare) {
      prepare()
        .then(() => this.setState({ready: true}))
        .catch(e => this.setState({prepareError: e}));
    }
  };

  render() {
    const {children, enabled} = this.props;
    const isEnabled = enabled == null ? __DEV__ : enabled;
    if (!isEnabled) {
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
                )}
              </>
            ) : (
              <SafeAreaView style={{flex: 1}}>
                {!this.state.showPage
                  ? children
                  : this.state.showPageSelector
                  ? this.renderPageSelector()
                  : this.state.pages[this.state.currentPage]?.Component}
              </SafeAreaView>
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
                  this.load();
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
                }
              }}>
              <Text style={[styles.text]}>🛠️</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </DragItem>
      </>
    );
  }

  renderPageSelector = () => {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <Text
          style={{
            color: 'black',
            textAlign: 'center',
            marginTop: 15,
            fontWeight: 'bold',
          }}>
          Select a design
        </Text>
        <ScrollView contentContainerStyle={{paddingBottom: 15}}>
          {this.state.pages.map((x, i) => (
            <TouchableOpacity
              key={i}
              style={{
                marginHorizontal: 15,
                marginTop: 15,
                padding: 15,
                borderWidth: 1,
                borderRadius: 10,
              }}
              onPress={() => {
                const page = this.state.pages[i];
                this.setState({
                  currentPage: i,
                  showPageSelector: false,
                  ready: !page.prepare,
                });
                if (page.prepare) {
                  page
                    .prepare()
                    .then(() => this.setState({ready: true}))
                    .catch(e => this.setState({prepareError: e}));
                }
              }}>
              <Text style={{color: 'black'}}>{x.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  text: {
    fontFamily: Platform.OS == 'ios' ? 'Courier New' : 'monospace',
    color: 'white',
  },
  showButtonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 15,
    height: 60,
    width: 60,
  },
  showButton: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
