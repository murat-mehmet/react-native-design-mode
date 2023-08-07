import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {context} from "./design-context";

const ThemeSwitchButton = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(context.parameters['designer'].themeSwitcher.value);

    useEffect(() => {
        handleThemeChange(isDarkTheme);
    }, []);
    const handleThemeChange = (value) => {
        setIsDarkTheme(value);
        context.parameters['designer'].themeSwitcher.value = value;
        context.loaders['designer.themeSwitcher'] = () => {
            context.parameters['designer'].themeSwitcher.set(context, value);
        };
    };

    return (
        <TouchableOpacity
            style={[styles.button, isDarkTheme && styles.darkButton]}
            onPress={() => handleThemeChange(!isDarkTheme)}
        >
            <Text style={[styles.buttonText, isDarkTheme && styles.darkButtonText]}>{isDarkTheme ? 'Dark' : 'Light'}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
        backgroundColor: '#fff',
    },
    darkButton: {
        backgroundColor: '#333',
    },
    buttonText: {
        fontWeight: 'bold',
        color: '#333',
    },
    darkButtonText: {
        color: 'white'
    }
});

export default ThemeSwitchButton;
