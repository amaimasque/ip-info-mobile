import React, {Dispatch, createContext, useEffect, useReducer} from 'react';
import reducer, {LoginAction, LoginState, initializer} from '../reducers/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {replace} from '../utils/RootNavigation';

type AuthContextType = {
  state: LoginState;
  dispatch: Dispatch<LoginAction>;
};
export const AuthContext = createContext<AuthContextType>({
  state: {},
  dispatch: () => {},
});

export const AuthProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, {}, initializer);

  useEffect(() => {
    async function checkUser() {
      const user = await AsyncStorage.getItem('user');
      console.log('user', user)
      if (user) {
        replace('Home');
      }
    }

    checkUser();
  }, []);
  useEffect(() => {
    if (state.email && state.password) {
      console.log('state', state)
      AsyncStorage.setItem('user', JSON.stringify(state));
    }
  }, [state]);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
