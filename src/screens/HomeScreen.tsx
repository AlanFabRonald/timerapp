import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  Appearance,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { searchRepositories } from '../redux/repositoriesSlice';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dispatch = useDispatch();
  const { repositories, loading, error } = useSelector((state) => state?.repositories || {});

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state?.isConnected !== null) {
        setIsConnected(state.isConnected);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          setIsDarkMode(Appearance.getColorScheme() === 'dark');
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleDarkMode = async () => {
    try {
      const newTheme = !isDarkMode ? 'dark' : 'light';
      await AsyncStorage.setItem('theme', newTheme);
      setIsDarkMode(!isDarkMode);
    } catch (error) {
      console.log('Error toggling theme:', error);
    }
  };

  const search = () => {
    if (query && isConnected) {
      dispatch(searchRepositories(query));
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? '#121212' : 'white',
        },
      ]}
    >
      <View
        style={[
          styles.appBar,
          {
            backgroundColor: isDarkMode ? '#1F1F1F' : '#2196F3',
          },
        ]}
      >
        <Text style={styles.appBarTitle}>GitHub Explorer</Text>
        <TouchableOpacity onPress={toggleDarkMode}>
          <Icon name={isDarkMode ? 'sunny' : 'moon'} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {!isConnected && (
        <Text style={styles.noConnectionText}>No Internet Connection</Text>
      )}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: isDarkMode ? '#555' : '#ccc',
              color: isDarkMode ? 'white' : 'black',
              backgroundColor: isDarkMode ? '#333' : 'white',
            },
          ]}
          placeholder="Search repositories..."
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
        />
        <Button title="Search" onPress={search} />
      </View>

      {loading && (
        <Text
          style={{
            color: isDarkMode ? 'white' : 'black',
            textAlign: 'center',
          }}
        >
          Loading...
        </Text>
      )}
      {error && (
        <Text
          style={{
            color: isDarkMode ? 'white' : 'black',
            textAlign: 'center',
          }}
        >
          Error fetching repositories
        </Text>
      )}
      <FlatList
        data={repositories}
        keyExtractor={(item) => item?.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item) {
                navigation.navigate('RepositoryDetails', { repository: item });
              }
            }}
          >
            <View
              style={[
                styles.listItem,
                {
                  backgroundColor: isDarkMode ? '#333' : 'white',
                },
              ]}
            >
              <Text
                style={[
                  styles.repoName,
                  {
                    color: isDarkMode ? 'white' : 'black',
                  },
                ]}
              >
                {item?.name ?? 'Unnamed Repository'}
              </Text>
              <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                {item?.owner?.login ?? 'Unknown Owner'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Favorites')}
      >
        <Text style={styles.fabText}>★</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 16,
    paddingBottom: 16,
    elevation: 4,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    paddingLeft: 8,
  },
  listItem: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  repoName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2196F3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
  },
  noConnectionText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});
