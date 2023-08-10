import React from "react";
import {Alert, StyleSheet, Text, TouchableOpacity} from "react-native";

export const ShutDownButton = ({onRemove}) => {

    const onPress = () => {
        Alert.alert("Hide designer?", "Designer will be removed until you completely re-install this app. Are you sure to continue?",
            [
                {text: "Cancel", style: 'cancel'},
                {text: "Yes, remove it.", onPress: onRemove},
            ])
    }
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={{fontSize: 18}}>⏼</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});
