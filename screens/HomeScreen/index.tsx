import {
  TextInput,
  SafeAreaView,
  StyleSheet,
  View,
  ImageBackground,
  ActivityIndicator,
  ToastAndroid,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  ScrollView,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import {NetworkInfo} from 'react-native-network-info';
import {getIpInfo} from '../../api/ipInfo';
import {AuthContext} from '../../providers/AuthProvider';
import {LOGIN_ACTION_TYPES} from '../../reducers/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {replace} from '../../utils/RootNavigation';

const bg = require('../../assets/splashscreen.jpg');

const styles = StyleSheet.create({
  logo: {
    height: 100,
    width: 100,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    flex: 1,
    marginRight: 10,
    backgroundColor: 'white',
  },
  background: {
    display: 'flex',
    height: '100%',
  },
  loginButton: {
    width: 300,
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
  },
  informationPanel: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
  },
  noInfo: {
    alignSelf: 'center',
  },
  infoText: {
    textTransform: 'capitalize',
  },
  infoHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  searchItem: {
    backgroundColor: '#edf5ff',
    padding: 5,
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

function Home() {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const {state, dispatch} = useContext(AuthContext);

  const getUserIP = useCallback(async () => {
    const ipAddress = await NetworkInfo.getIPAddress();
    setIp(ipAddress);
    setTimeout(() => geIPInfo(ipAddress), 1000);
  }, []);

  const geIPInfo = useCallback(
    async (passedIp?: string | null) => {
      if (ip) {
        try {
          setLoading(true);
          const res = await getIpInfo(passedIp ?? ip);
          setResponse(await res.json());
        } catch (error) {
          ToastAndroid.show(
            error?.message ?? 'Unable to find geo information',
            3,
          );
        } finally {
          setLoading(false);
        }
      }
    },
    [ip],
  );

  const handleOnLogout = async () => {
    dispatch({
      type: LOGIN_ACTION_TYPES.remove_credentials,
    });
    await AsyncStorage.removeItem('user');
    replace('Login');
  };

  useEffect(() => {
    getUserIP();
  }, [getUserIP]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Confirm', 'Are you sure you want to go logout?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: handleOnLogout,
        },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const handleSearch = () => {
    if (
      ip &&
      /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/.test(ip)
    ) {
      setHistory([...history, ip]);
      geIPInfo();
    } else {
      ToastAndroid.show('Invalid IP address', 3);
    }
  };

  const handleOnClear = useCallback(() => {
    setIp(null);
    setResponse(null);
  }, []);

  const handleSearchItemClick = useCallback(
    (item: string) => {
      setIp(item);
      geIPInfo(item);
    },
    [geIPInfo],
  );

  const handleCheck = (checked: boolean, index: number) => {
    if (!selectedItems.includes(index) && checked) {
      setSelectedItems([...selectedItems, index]);
    }
    if (!checked && selectedItems.includes(index)) {
      const selectedItemsCopy = [...selectedItems];
      selectedItemsCopy.splice(selectedItems.indexOf(index), 1);
      setSelectedItems([...selectedItemsCopy]);
    }
  };

  const handleClearItems = () => {
    let historyCopy = [...history];
    historyCopy = historyCopy.filter(
      (_, index) => !selectedItems.includes(index),
    );
    console.log(historyCopy, selectedItems);
    setHistory([...historyCopy]);
    setSelectedItems([]);
  };

  return (
    <SafeAreaView>
      <ImageBackground source={bg} style={styles.background}>
        <View style={styles.toolbar}>
          <TextInput
            style={styles.input}
            onChangeText={text => setIp(text)}
            value={ip ?? ''}
            placeholder="IP address"
          />
          {ip && (
            <Icon.Button
              name="trash"
              backgroundColor="#3b5998"
              onPress={handleOnClear}>
              Clear
            </Icon.Button>
          )}
          <View style={{marginRight: 5}} />
          <Icon.Button
            name="search"
            backgroundColor="#3b5998"
            onPress={handleSearch}>
            Search
          </Icon.Button>
        </View>
        <View style={styles.informationPanel}>
          {loading && <ActivityIndicator size={'large'} />}
          {!response && !loading && (
            <Text style={styles.noInfo}>No information</Text>
          )}
          {response && !loading && (
            <ScrollView>
              <Text style={styles.infoHeader}>Geo information</Text>
              {Object.keys(response).map((key, index) => (
                <Text style={styles.infoText} key={key + index}>
                  {key}: {response ? `${response[key]}` : ''}
                </Text>
              ))}
            </ScrollView>
          )}
        </View>
        <View style={styles.informationPanel}>
          <FlatList
            data={history}
            extraData={[selectedItems]}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={styles.searchItem}
                key={`ip-${index}`}
                onPress={() => handleSearchItemClick(item)}>
                <CheckBox
                  disabled={false}
                  value={selectedItems.includes(index)}
                  onValueChange={newValue => handleCheck(newValue, index)}
                />
                <Text>
                  {index + 1}. {item}
                </Text>
                <Icon name="chevron-right" />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => item + index}
            ListHeaderComponent={
              <View
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.infoHeader}>Recent searches</Text>
                {selectedItems.length > 0 && (
                  <Icon.Button
                    name="trash"
                    backgroundColor="#3b5998"
                    onPress={handleClearItems}
                  />
                )}
              </View>
            }
            ListEmptyComponent={
              <Text style={styles.noInfo}>No information</Text>
            }
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
export default Home;
