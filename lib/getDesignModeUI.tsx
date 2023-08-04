import React from "react";
import {StyleSheet} from "react-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {DesignMode} from "./DesignMode";

export function getDesignModeUI() {
    return () => (
        <GestureHandlerRootView style={StyleSheet.absoluteFillObject}
                                pointerEvents={"box-none"}>
            <DesignMode enabled />
        </GestureHandlerRootView>
    );
}
