import AsyncStorage from '@react-native-async-storage/async-storage';

export type LoginState = {
  email?: string;
  password?: string;
};

export type LoginAction = {
  type: string;
  payload?: any;
};

export const initializer = async (initialValue = {}) => {
  const user = JSON.parse((await AsyncStorage.getItem('user')) ?? '');
  console.log('initializer', user.email, user.password);
  return user || initialValue;
};

export const LOGIN_ACTION_TYPES = {
  save_credentials: 'save_credentials',
  remove_credentials: 'remove_credentials'
};

export default function reducer(state: LoginState, action: LoginAction) {
  if (action.type === LOGIN_ACTION_TYPES.save_credentials) {
    return {
      ...state,
      ...action.payload,
    };
  }
  if (action.type === LOGIN_ACTION_TYPES.remove_credentials) {
    return {};
  }
  throw Error('Unknown action.');
}
