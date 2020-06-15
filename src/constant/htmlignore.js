
/**
 * App Actions
 */
import { StyleSheet } from 'react-native';
import { AppStyles, AppColors, AppSizes, } from '@theme';

export default {
  ignoredStyles: [
    'display', 'text-align', 'letter-spacing',
    'font-family', 'font-weight', 'font-style',
    'text-decoration-style', 'text-decoration-color',
    'line-height',
  ],
  // styles: StyleSheet.create({
  //   richTextToolbar: {
  //     height: 30,
  //     backgroundColor: AppColors.white,
  //     flexWrap: 'wrap',
  //     borderWidth: 0.2,
  //     borderColor: AppColors.gray,
  //   },
  //   selectedButtonToolbar: {
  //     backgroundColor: AppColors.white,
  //     flex: 1,
  //     height: 30
  //   },
  //   unSelectedButtonToolbar: {
  //     flex: 1, height: 30
  //   }
  // }),
  richTextToolbar: {
    height: 30,
    backgroundColor: AppColors.white,
  },
  selectedButtonToolbar: {
    backgroundColor: AppColors.white,
    flex: 1,
    height: 30
  },
  unSelectedButtonToolbar: {
    flex: 1, height: 30
  },

  customCSS: 'body{padding: 0; color : #68737f; font-size: 14px;  padding-right : 10px} b {color: #68737f; font-size: 14px} #zss_editor_content { padding-left: 20; padding-right: 0; } .hidden-client{display: none}',
};
