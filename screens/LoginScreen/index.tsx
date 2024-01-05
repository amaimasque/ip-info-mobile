import {
  TextInput,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  ImageBackground,
  Button,
  ToastAndroid,
} from 'react-native';
import React, {useCallback, useContext} from 'react';
import {LOGIN_ACTION_TYPES} from '../../reducers/login';
import {AuthContext} from '../../providers/AuthProvider';
import {ScreenProps} from '../../App';

const bg = require('../../assets/splashscreen.jpg');

const styles = StyleSheet.create({
  logo: {
    height: 100,
    width: 100,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 300,
  },
  background: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  container: {
    backgroundColor: 'white',
    padding: 10,
  },
  loginButton: {
    width: 300,
  },
});

function Login({navigation}: ScreenProps) {
  const {state, dispatch} = useContext(AuthContext);

  const handleOnPressLogin = useCallback(() => {
    if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(state?.email ?? '')
    ) {
      return ToastAndroid.show('Invalid email address!', 3);
    }
    console.log(state?.email, state?.password);
    navigation.replace('Home');
  }, [navigation, state?.email, state?.password]);

  return (
    <SafeAreaView>
      <ImageBackground source={bg} style={styles.background}>
        <View style={styles.container}>
          <Image source={require('../../assets/ip.png')} style={styles.logo} />
          <TextInput
            style={styles.input}
            onChangeText={text =>
              dispatch({
                type: LOGIN_ACTION_TYPES.save_credentials,
                payload: {
                  email: text,
                },
              })
            }
            value={state.email}
            placeholder="Email"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            onChangeText={text =>
              dispatch({
                type: LOGIN_ACTION_TYPES.save_credentials,
                payload: {
                  password: text,
                },
              })
            }
            value={state.password}
            placeholder="Password"
            secureTextEntry
          />
          <Button title="LOGIN" onPress={handleOnPressLogin} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
export default Login;
