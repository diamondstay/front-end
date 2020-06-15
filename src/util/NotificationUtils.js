import NotificationUtils from './NotificationUtils';
import { AppStyles, AppColors, AppSizes, } from '@theme';

import React, { Component } from 'react';
import { StyleSheet, Image, View } from 'react-native';
import _ from 'lodash';
import { MessageBarManagerSimple } from '@component'

var MessageBarManager = require('react-native-message-bar').MessageBarManager;
const MESSAGE_BAR_TOP_INSET = 15;
const HEIGHT_CONTENT = 50;
const DURATION_NOTI = 2 * 60 * 1000; // show 2 minute popup
const styles = StyleSheet.create({
  containerStyle: {
    paddingLeft: AppSizes.paddingXSmall,
    paddingRight: AppSizes.paddingXSmall,
    paddingBottom: AppSizes.paddingXSmall,
    flex: 1
  },
  imageContainer: {
    backgroundColor: 'white',
    height: '100%',
    width: HEIGHT_CONTENT,
    justifyContent: 'center',
    alignItems: 'center'
  },

})

function getAvartar(messageType) {
  switch (messageType) {
    case NotificationUtils.messageType.ERROR:
      imageSource = require('@images/ic_noti_error.png');
      break;
    case NotificationUtils.messageType.SUCCESS:
      imageSource = require('@images/ic_noti_success.png');
      break;
    case NotificationUtils.messageType.WARNNING_CONNECTION:
      imageSource = require('@images/lost_connect.png');
      break;
    case NotificationUtils.messageType.INFO:
      imageSource = require('@images/ic_noti_info.png');
      break;
  }
  return <View style={[styles.imageContainer, { backgroundColor: getColor(messageType) }]}>
    <Image source={imageSource} style={{ width: HEIGHT_CONTENT / 2, height: HEIGHT_CONTENT / 2, }} />
  </View>
}

function getColor(messageType) {
  switch (messageType) {
    case NotificationUtils.messageType.ERROR:
      color = AppColors.red;
      break;
    case NotificationUtils.messageType.SUCCESS:
      color = 'green';
      break;
    case NotificationUtils.messageType.WARNNING_CONNECTION:
      color = AppColors.black;
      break;
    case NotificationUtils.messageType.INFO:
      color = '#0B9FD2';
      break;
  }
  return color;
}

export default {

  messageType: {
    ERROR: 'error',
    SUCCESS: 'custom',
    WARNNING_CONNECTION: 'warnning_connection',
    INFO: 'info',
  },
  showMessageBar: (title, message, messageType, onTapped, onHide) => {
    MessageBarManager.showAlert({
      title,
      titleColor: AppColors.darkBlack,
      avatar: getAvartar(messageType),
      message,
      alertType: 'custom',
      duration: DURATION_NOTI,
      messageNumberOfLines: 2,
      stylesheetExtra: {
        strokeColor: getColor(messageType),
        backgroundColor: 'white',
      },
      onHide: () => { onHide && onHide() },
      onTapped: _.throttle(() => {
        onTapped && onTapped();
        MessageBarManager.hideAlert();
      }, 4000, { 'trailing': false })

    });
  },

  notifiationTag: {
    LOCAL_NOTIFICATION: 'LOCAL_NOTIFICATION',
  },

  showMessageBarSimple: (info) => {
    MessageBarManagerSimple.showAlert(info)
  },

};