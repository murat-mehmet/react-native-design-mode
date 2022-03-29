# Design Mode for React Native

*Design your views easily.*

- The goal is to create a simple developer interface to create views without having to navigate through app flow.

- By default, design mode is always shown in development mode and always hidden in production. To override this behavior, set the `enabled` property of `DesignMode`.

- Toggle design mode simply by pressing the floating button.

## Installation

```sh
npm install react-native-design-mode --save
- or -
yarn add react-native-design-mode
```

## Usage

#### Single view

```javascript
import {DesignMode} from "react-native-design-mode";

const App = () => {
    return (
        <>
            <AppContainer />
            <DesignMode>
                <YourAwesomeView />
            </DesignMode>
        </>
    );
}
```

#### Single view that needs preparation (auth, etc)

```javascript
import {DesignMode} from "react-native-design-mode";

const App = () => {
    return (
        <>
            <AppContainer />
            <DesignMode prepare={() => auth()}>
                <YourAwesomeView />
            </DesignMode>
        </>
    );
}
```

#### Multiple views

```javascript
import {DesignMode, DesignPage} from "react-native-design-mode";

const App = () => {
    return (
        <>
            <AppContainer />
            <DesignMode>
                <DesignPage title={'Awesome View'}>
                    <YourAwesomeView />
                </DesignPage>
                <DesignPage title={'Perfect View'}>
                    <YourPerfectView />
                </DesignPage>
            </DesignMode>
        </>
    );
}
```

#### Multiple views that require preparation (auth, etc)

```javascript
import {DesignMode, DesignPage} from "react-native-design-mode";

const App = () => {
    return (
        <>
            <AppContainer />
            <DesignMode>
                <DesignPage title={'Awesome View'} prepare={() => auth()}>
                    <YourAwesomeView />
                </DesignPage>
                <DesignPage title={'Perfect View'} prepare={() => auth()}>
                    <YourPerfectView />
                </DesignPage>
            </DesignMode>
        </>
    );
}
```

#### Cleaner usage

```javascript
// ./designs/AwesomeViewDesign.js
export const YourAwesomeViewDesign = () => {
    return (
        <DesignPage title={'Awesome View'} prepare={() => auth()}>
            <YourAwesomeView />
        </DesignPage>
    );
}

// ./designs/PerfectViewDesign.js
export const YourPerfectViewDesign = () => {
    return (
        <DesignPage title={'Perfect View'} prepare={() => auth()}>
            <YourPerfectView />
        </DesignPage>
    );
}


// ./App.js
import {DesignMode, DesignPage} from "react-native-design-mode";
import {YourAwesomeViewDesign} from "./designs/AwesomeViewDesign";
import {YourPerfectViewDesign} from "./designs/PerfectViewDesign";

const App = () => {
    return (
        <>
            <AppContainer />
            <DesignMode>
                <YourAwesomeViewDesign />
                <YourPerfectViewDesign />
            </DesignMode>
        </>
    );
}
```
