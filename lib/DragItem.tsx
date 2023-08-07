import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useMemo} from 'react';

import {Dimensions, StyleSheet} from 'react-native';
import {Gesture, GestureDetector, PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {runOnJS, runOnUI, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming,} from 'react-native-reanimated';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const POINT_HEIGHT = SCREEN_HEIGHT / 3;
const POINT_WIDTH = SCREEN_WIDTH / 2;
const gapY = 50;
const gapX = 20;
const CIRLE_SIZE = 60;

const DragItem = ({children}) => {
    const origin = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    useEffect(() => {
        (async () => {
            const data = await AsyncStorage.getItem('dragItem');
            if (data) {
                const {x, y} = JSON.parse(data);
                translateX.value = x;
                translateY.value = y;
            }
        })();
    }, []);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const saveToStorage =() => {
        setTimeout(() => {
            AsyncStorage.setItem(
                'dragItem',
                JSON.stringify({x: translateX.value, y: translateY.value}),
            );
        }, 300);
    };
    const snapTo = (x, y) => {

        const topRight = x > SCREEN_WIDTH / 2 && y < POINT_HEIGHT;
        const topLeft = x < SCREEN_WIDTH / 2 && y < POINT_HEIGHT;
        const bottomLeft = x < SCREEN_WIDTH / 2 && y > SCREEN_HEIGHT - POINT_HEIGHT;
        const bottomRight =
            x > SCREEN_WIDTH / 2 && y > SCREEN_HEIGHT - POINT_HEIGHT;
        const middleLeft =
            x < SCREEN_WIDTH / 2 &&
            y < SCREEN_HEIGHT - POINT_HEIGHT &&
            y > POINT_HEIGHT;
        const middleRight =
            x > SCREEN_WIDTH / 2 &&
            y < SCREEN_HEIGHT - POINT_HEIGHT &&
            y > POINT_HEIGHT;

        if (topRight) {
            translateX.value = withTiming(SCREEN_WIDTH - CIRLE_SIZE - gapX * 2);
            translateY.value = withTiming(-SCREEN_HEIGHT + CIRLE_SIZE + gapY * 2);
        } else if (topLeft) {
            translateX.value = withTiming(0);
            translateY.value = withTiming(-SCREEN_HEIGHT + CIRLE_SIZE + gapY * 2);
        } else if (bottomLeft) {
            translateX.value = withTiming(0);
            translateY.value = withTiming(0);
        } else if (bottomRight) {
            translateX.value = withTiming(SCREEN_WIDTH - CIRLE_SIZE - gapX * 2);
            translateY.value = withTiming(0);
        } else if (middleLeft) {
            translateX.value = withTiming(0);
            translateY.value = withTiming(-SCREEN_HEIGHT / 2 + CIRLE_SIZE / 2 + gapY);
        } else if (middleRight) {
            translateX.value = withTiming(SCREEN_WIDTH - CIRLE_SIZE - gapX * 2);
            translateY.value = withTiming(-SCREEN_HEIGHT / 2 + CIRLE_SIZE / 2 + gapY);
        } else {
            translateX.value = withTiming(0);
            translateY.value = withTiming(0);
        }
        saveToStorage();
    };

    const pan = Gesture.Pan()
        .onStart((event) => {
            origin.x.value = translateX.value;
            origin.y.value = translateY.value;
        }).onChange((e) => {
            translateX.value = e.translationX + origin.x.value;
            translateY.value = e.translationY + origin.y.value;
        }).onFinalize((e) => {
            snapTo(e.absoluteX, e.absoluteY);
        }).runOnJS(true);
    const rStyles = useAnimatedStyle(() => {
        return {
            width: CIRLE_SIZE,
            height: CIRLE_SIZE,
            transform: [
                {translateX: translateX.value},
                {translateY: translateY.value},
            ],
        };
    });

    const clonedChildren = useMemo(
        () =>
            React.cloneElement(children, {
                style: [
                    StyleSheet.flatten(children.props.style),
                    {
                        bottom: gapY,
                        left: gapX,
                    },
                ],
            }),
        [children],
    );

    return (
        <GestureDetector gesture={pan}>
            <Animated.View style={[rStyles, {
                position: 'absolute',
                bottom: 0,
                left: 0
            }]}>{clonedChildren}</Animated.View>
        </GestureDetector>
    );
};

export default DragItem;
