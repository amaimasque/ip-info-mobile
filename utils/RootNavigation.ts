import {
  NavigationContainerRefWithCurrent,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {RootStackParamList} from '../App';

export const navigationRef: NavigationContainerRefWithCurrent<RootStackParamList> =
  createNavigationContainerRef();

export function navigate(name: keyof RootStackParamList, params: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function replace(name: keyof RootStackParamList) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      routes: [
        {
          name,
        },
      ],
      index: 0,
    });
  }
}
