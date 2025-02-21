import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Appearance, TouchableOpacity, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../redux/favoritesSlice';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function RepositoryDetails({ route }) {
  const navigation = useNavigation();

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
  const { repository } = route.params;
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const existingFavorite = favorites.find((item) => item.id === repository.id);
    setIsFavorite(!!existingFavorite);
    fetch(`${repository.contributors_url}`)
      .then((response) => response.json())
      .then((data) => setContributors(data))
      .catch((error) => console.error('Error fetching contributors:', error));
  }, [favorites, repository]);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavorite(repository));
    } else {
      dispatch(addFavorite(repository));
    }
  };

  const creationDate = format(new Date(repository.created_at), 'MMMM dd, yyyy');
  const lastUpdateDate = format(new Date(repository.updated_at), 'MMMM dd, yyyy');

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.appBar, {
        backgroundColor: isDarkMode ? '#1F1F1F' : '#2196F3',
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Repository Details</Text>
      </View>
      <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : 'white' }]}>
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1F1F1F' : 'white' }]}>
          <Image source={{ uri: repository.owner.avatar_url }} style={styles.image} />
          <Text style={[styles.repoName, { color: isDarkMode ? 'white' : 'black' }]}>{repository.name}</Text>
          <Text style={[styles.Text, { color: isDarkMode ? 'white' : 'gray' }]}>Owner: {repository.owner.login}</Text>
          <Text style={[styles.description, { color: isDarkMode ? 'white' : 'gray' }]}>Description: {repository.description}</Text>
          <Text style={[styles.Text, { color: isDarkMode ? 'white' : 'gray' }]}>Stars: {repository.stargazers_count}</Text>
          <Text style={[styles.Text, { color: isDarkMode ? 'white' : 'gray' }]}>Forks: {repository.forks_count}</Text>
          <Text style={[styles.Text, { color: isDarkMode ? 'white' : 'gray' }]}>Language: {repository.language}</Text>
          <Text style={[styles.Text, { color: isDarkMode ? 'white' : 'gray' }]}>Created On: {creationDate}</Text>
          <Text style={[styles.Text, { color: isDarkMode ? 'white' : 'gray' }]}>Last Updated: {lastUpdateDate}</Text>
          <View style={styles.buttonContainer}>
            <Button
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              onPress={handleToggleFavorite}
            />
          </View>
        </View>

        <View style={[styles.contributorsContainer, { backgroundColor: isDarkMode ? '#333' : '#f8f8f8' }]}>
          <Text style={[styles.contributorsTitle, { color: isDarkMode ? 'white' : 'black' }]}>Contributors:</Text>
          {contributors.length > 0 ? (
            contributors.map((contributor) => (
              <View key={contributor.id} style={styles.contributor}>
                <Image source={{ uri: contributor.avatar_url }} style={styles.contributorAvatar} />
                <Text style={[styles.Text, { color: isDarkMode ? 'white' : 'gray' }]}>{contributor.login}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.Text, { color: isDarkMode ? 'white' : 'gray' }]}>No contributors found.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
  card: {
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  repoName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  Text: {
    fontSize: 12,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  contributorsContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contributorsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contributor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contributorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});
