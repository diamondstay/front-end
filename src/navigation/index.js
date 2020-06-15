/**
 * App Navigation
 */
import { LoginScreen } from "@container";
import React from "react";
import { Actions, Lightbox, Scene, Stack, Overlay } from "react-native-router-flux";
import { RemiderScreen, AlarmScreen, MeditationAlarmScreen } from "@container";
/* Routes ==================================================================== */

export default Actions.create(
    <Overlay>
        <Lightbox key='lightbox' initial>
            {/* <Scene key="splash" component={SplashScreen} initial />
            <Scene key="login" component={LoginScreen} /> */ }
            <Scene key="login" component={LoginScreen} /> 
            <Stack key='root' hideNavBar>
                
            </Stack>

        </Lightbox>
    </Overlay>
);
