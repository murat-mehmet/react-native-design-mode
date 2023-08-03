import React from "react";
import {StyleSheet, View} from "react-native";
import {DesignMode} from "./DesignMode";

export function getDesignModeUI() {
    return () => (
        <View style={StyleSheet.absoluteFillObject}>
            <DesignMode enabled />
        </View>
    );
}
