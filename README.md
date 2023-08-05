# 🛠️ React Native Design Mode - Simplify Creating Views

[![npm version](https://badge.fury.io/js/react-native-design-mode.svg)](https://badge.fury.io/js/react-native-design-mode)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)


<h4 align="center">
    A Lightweight Storybook Alternative for Effortless View Design.
</h4>
<div align="center">
    <img src="https://raw.github.com/murat-mehmet/react-native-design-mode/master/images/basic.png" width="250px" /> 
    <img src="https://raw.github.com/murat-mehmet/react-native-design-mode/master/images/search.png" width="250px" /> 
</div>

# Table of Contents

1. &#128196; [Description](#-description)
2. &#128640; [Features](#-features)
3. &#9881; [Installation](#-installation)
4. &#127937; [Getting Started](#-getting-started)
5. &#128161; [Usage](#-usage)
  - &#127912; [Creating Designs](#-creating-designs)
  - &#128260; [Moving Between Designs](#-moving-between-designs)
  - &#128295; [Creating Designs with Variants](#-creating-designs-with-variants)
  - &#128193; [Categorized List View](#-categorized-list-view)
  - &#127880; [Draggable Floating Button](#-draggable-floating-button)
6. &#9881; [Configuration](#-configuration)
  - &#128196; [`main.js`](#-mainjs)
  - &#128196; [`index.js`](#-indexjs)
  - &#128196; [`designer.requires.js`](#-designerrequiresjs)
  - &#128196; [`preview.js`](#-previewjs)
7. &#128074; [Contributing](#-contributing)
8. &#128219; [License](#-license)
9. &#128231; [Contact](#-contact)

## &#128196; Description
React Native Design Mode is a developer-friendly package that streamlines the process of creating views without the need to navigate through the entire app flow. If you've found Storybook to be a bit heavy for your simple projects, this package offers a lightweight alternative with all the features you need.

Heavily inspired by storybook project so most things are similar.

## &#128640; Features

- Effortless design mode toggle with a floating button
- Allows developer to focus more on quickly designing views
- Lightweight and efficient implementation
- Familiar structure that is inspired by Storybook

## &#9881; Installation

You can install the package via npm or yarn:

```bash
npm install react-native-design-mode
# or
yarn add react-native-design-mode
```

## &#127937; Getting Started
Run CLI to quickly install designer into your project.
```bash
designer install
```


It does two things:
1. Creates a `.designer` folder in your project root with required files in it.
2. Adds `designer update` command to the prestart script.
+ Note:
  You can use `-c` flag to change the designer folder. Run `designer help install` for details.

After running the command you will have the following folder structure
```
├── project root
│   └── 📁 .designer
│       ├── 📄 designer.requires.js
│       ├── 📄 index.js
│       ├── 📄 main.js
│       └── 📄 preview.js
```
## &#128161; Usage
Import the designer file
```js
import Designer from "./.designer";
```
Add `Designer` component in your `App.tsx`
```jsx
const App = () => {
  return (
    <>
      <SafeAreaProvider>
        <AppContainer />
      </SafeAreaProvider>
      <Designer />
    </>
  );
}
```
Or use it directly in your `index.js` file
```js
AppRegistry.registerComponent(appName, () => Designer);
```

#### Now you are ready to create your first design!

### &#127912; Creating designs
For example we have a `Login.tsx` screen that we want to design.

We simply create a `Login.design.tsx` file near it.
```typescript jsx
// src/Login.design.tsx

import Login from './Login';

export default {
  title: 'Login',
  component: Login,
}
```

Finally, after adding a new design file we need to update the design list.
We either restart the bundler, which will trigger prestart script or simply use cli to update the list.
```bash
npm start
# or
designer update
```

That's it! Now open the app and you will see the Login screen in design mode.

### &#128260; Moving between designs

While we are on the design selection screen, floating button works like a toggle to switch design mode on/off.

After you select a design, we can click on floating button to go back to design list.

<div>
    <img src="https://raw.github.com/murat-mehmet/react-native-design-mode/master/images/predesign.jpg" width="250px" />
    <img src="https://raw.github.com/murat-mehmet/react-native-design-mode/master/images/design.jpg" width="250px" />
</div>

### &#128295; Creating designs with variants

We can easily create different variants of a design by exporting more design objects.
```typescript jsx
// src/Login.design.tsx

import Login from './Login';

export default {
  title: 'Login',
  component: Login,
}

// export default variant
export const Basic = {}

// export another variant
export const Dark = () => <Login theme={'dark'} />
```

### &#128193; Categorized list view

We can categorize our views infinitely by adding group names in titles

<div>
    <img src="https://raw.github.com/murat-mehmet/react-native-design-mode/master/images/category.png" width="250px" />
</div>

```typescript jsx
// src/Login.design.tsx

import Login from './Login';

export default {
  title: 'Authentication/Login',
  component: Login,
}
```

### &#127880; Draggable floating button

We have the flexibility to position the floating button on the screen edges, ensuring it won't obstruct our view design process.

<div>
    <img src="https://raw.github.com/murat-mehmet/react-native-design-mode/master/images/floating1.png" width="250px" />
    <img src="https://raw.github.com/murat-mehmet/react-native-design-mode/master/images/floating2.png" width="250px" />
</div>

## &#9881; Configuration
### &#128196; `main.js`
```js
module.exports = {
  designs: ["../src/**/*.design.@(js|jsx|ts|tsx)"],
};
```
- `designs`: This is an array that defines the location of our design files. By default, we use a glob pattern to load all *.design.js files inside the src directory and its subdirectories. You may need to adjust the path based on your project structure.
- `excludePaths`: This is an array of path patterns that will be excluded from loading. By default it is `['**/node_modules']`

### &#128196; `index.js`
```js
import { getDesignModeUI } from "react-native-design-mode";

// comment out the following line when deploying to production
import "./designer.requires";

const Designer = getDesignModeUI();

export default Designer;
```
All designs are imported here. Before deploying to production either you remove `<Designer />` from usage or comment out `import "./designer.requires";` line in this file.

### &#128196; `designer.requires.js`
```js
/* do not change this file, it is auto generated by design mode. */

import { context } from "react-native-design-mode";

context.initialize();
// ...
```
This is an auto generated file by `design update` command which will be automatically executed on every `npm run start`.

It is imported in `.designer/index.js` and contains all designs of your project.

You shouldn't modify this file as it will be overwritten.

### &#128196; `preview.js`
```js
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const decorators = [
  // Add SafeAreaProvider to all designs
  (Component, ctx) => (
    <SafeAreaProvider>
      <Component />
    </SafeAreaProvider>
  ),
];
```
This file is completely optional but it will help us create global declarations for all of our designs.
- `decorators`: This is an array of functions of Elements or Components that will be applied on every design.
We can use it to create wrappers like `SafeAreaProvider` or `Navigator`

Check this example where we apply navigator conditionally.
```js
// .designer/preview.js

const Stack = createStackNavigator();

export const decorators = [
  (Component, ctx) => {
    if (ctx.parameters.withNavigation)
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="design" screenOptions={{headerShown: false}}>
            <Stack.Screen name="design" component={Component} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    return Component;
  },
];

// src/Login.design.tsx

export default {
  title: "Login",
  component: Login,
  parameters: {
    withNavigation: true
  }
};
```
- `parameters`: Global parameters that will be applied on all designs. In the future we will use this for things like sorting etc.
- `loaders`: This is an object of promise functions that will be executed before displaying any design. The loaded results can be accessed from `ctx.loaded` field.

Example
```js
// .designer/preview.js

export const loaders = {
  stores: async () => getStores(),
};

// example of accesing "loaded" field in decorators
export const decorators = [
  (Component, ctx) => {
      return (
        <Provider {...ctx.loaded.stores}> {/* <-- */} 
          <Component />
        </Provider>
      );
  },
];

// src/Login.design.tsx

// example of accessing "loaded" field in designs
export default {
  title: "Login",
  component: Login,
  prepare: (ctx) => { 
    // Do something with ctx.loaded.stores 
  }
};
```

## &#128074; Contributing
Contributions are welcome! If you find a bug or want to add a new feature, feel free to submit a pull request. For major changes, please open an issue first to discuss the proposed changes.

## &#128219; License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## &#128231; Contact
If you have any questions or need assistance, feel free to open an issue.

Happy coding!

