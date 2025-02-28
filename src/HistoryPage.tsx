import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Appearance, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs'; // File system operations
import Share from 'react-native-share'; // Sharing functionality
import Icon from 'react-native-vector-icons/Ionicons';

const HistoryPage = ({ route, navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const { history = [] } = route.params || {}; // Access history from route.params

  // Function to export timer history as a JSON file
  const exportHistory = async () => {
    const fileName = `${RNFS.DocumentDirectoryPath}/timer_history.json`;
    const jsonData = JSON.stringify(history, null, 2);

    try {
      // Write the JSON data to a file
      await RNFS.writeFile(fileName, jsonData, 'utf8');

      // Share the file
      await Share.open({
        url: `file://${fileName}`,
        type: 'application/json',
        filename: 'timer_history.json',
      });
    } catch (error) {
      console.log('Error exporting history:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <View style={[styles.appBar, {
        backgroundColor: isDarkMode ? '#1F1F1F' : '#2196F3',
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Timer History</Text>
      </View>
      <ScrollView>
        {history.map((entry, index) => (
          <View
            key={index}
            style={[
              styles.historyEntry,
              {
                backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                shadowColor: isDarkMode ? '#000000' : '#cccccc',
              },
            ]}
          >
            <Text style={[styles.historyText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              Timer: {entry.name}
            </Text>
            <Text style={[styles.historyText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              Completed at: {entry.completionTime}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ margin: 10 }}>
        <Button title="Export Timer Data" onPress={exportHistory} />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 4,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10, // Adjusted to remove extra space
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyEntry: {
    padding: 8,
    marginVertical: 5,
    marginHorizontal:10,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  historyText: {
    fontSize: 16,
    marginBottom: 4,
  },
});

export default HistoryPage;