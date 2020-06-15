/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect, useRef, useContext, useReducer, Component } from 'react';
import { View, StatusBar, SafeAreaView } from 'react-native';
import { Router, Actions } from 'react-native-router-flux';
import { AppStyles, AppColors } from '@theme'
import AppRoutes from '@navigation'
import { connect, Provider } from 'react-redux'
import { applyMiddleware, compose, createStore } from 'redux'
import rootReducer, { StoreManager } from '@redux'
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import _ from 'lodash'
import * as RNLocalize from 'react-native-localize';
import Localization from '@localization'


const ReduxWithRouterFlux = connect()(Router)

// Load middleware
let middleware = [
    thunk, // Allows action creators to return functions (not just plain objects)
];

if (__DEV__) {
    // Dev-only middleware
    middleware = [
        ...middleware,
        createLogger(), // Logs state changes to the dev console
    ];
}

// Init redux store (using the given reducer & middleware)
const store = compose(
    applyMiddleware(...middleware),
)(createStore)(rootReducer);

export default class App extends Component {
    constructor(props) {
        super(props)
        Localization.setI18nConfig();
    }

    componentDidMount() {
        // MessageBarManager.registerMessageBar(this.refs.alert);
        // setTimeout(() => MessageBarManagerSimple.showAlert({
        //     title: "title", content: "content", duration: 120000, onPress: () => {
        //         console.log("onPres")
        //     }
        // }), 5000)
        StoreManager.register(store);
        RNLocalize.addEventListener('change', this.handleLocalizationChange);
    }

    componentWillUnmount() {
        // MessageBarManager.unregisterMessageBar();
        StoreManager.unregister();
        RNLocalize.removeEventListener('change', this.handleLocalizationChange);
    }

    handleLocalizationChange = () => {
        Localization.setI18nConfig();
        this.forceUpdate();
    };

    render() {
        return (
            <View style={AppStyles.appContainer}>
                <StatusBar barStyle="dark-content" />

                <Provider store={store}>
                    <ReduxWithRouterFlux scenes={AppRoutes} backAndroidHandler={this.onBackPress} />
                </Provider>
                {/* <MessageBarSimple ref="alert" /> */}
            </View>
        );
    }

    onBackPress = () => {
        /**
         * See ./navigation/index.js
         */
        const currentScene = Actions.currentScene;

        // Pretty sure app has focused on a scene
        if (!currentScene) return false;

        Actions.pop()

        return true;
    }
}
