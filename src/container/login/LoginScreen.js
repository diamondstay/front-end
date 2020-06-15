import React , { useState, useEffect } from 'react'
import { View, Text , StyleSheet} from 'react-native'

export default LoginScreen = (props) => {
    const [email , setEmail] = useState('')
    const [password, setPassword] = useState('')
    return(
        <View style={styles.container}>
            <Text>Login Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container : {
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    }
})