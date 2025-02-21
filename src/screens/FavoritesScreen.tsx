import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Appearance, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setFavorites } from '../redux/favoritesSlice';
import Icon from 'react-native-vector-icons/Ionicons';


export default function FavoritesScreen({ navigation }) {
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        setIsDarkMode(Appearance.getColorScheme() === 'dark');
      }
    };
    loadTheme();
  }, []);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const favorites = useSelector((state) => state.favorites);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadFavorites = async () => {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        dispatch(setFavorites(JSON.parse(savedFavorites)));
      }
    };
    loadFavorites();
  }, [dispatch]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : 'white', }]}>
      <View style={[styles.appBar, {
        backgroundColor: isDarkMode ? '#1F1F1F' : '#2196F3',
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Favorites</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('RepositoryDetails', { repository: item })}
          >
            <View style={[styles.listItem, { backgroundColor: isDarkMode ? '#1F1F1F' : 'white', }]}>
              <Text style={[styles.repoName, { color: isDarkMode ? 'white' : 'black', }]}>{item.name}</Text>
              <Text style={[styles.Text, { color: isDarkMode ? 'white' : 'gray', }]}>{item.owner.login}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,


  },
    appBar: {
      flexDirection: 'row',
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
      marginLeft: 16,
    },
  Text: {
    fontSize: 12,
    marginBottom: 10,
  },
  listItem: {
    padding: 15,
    margin:10,
    marginVertical: 8,
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
});
