import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const MainScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState('');
    const [timers, setTimers] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [completionModalVisible, setCompletionModalVisible] = useState(false);
    const [completedTimerName, setCompletedTimerName] = useState('');
    const [history, setHistory] = useState([]);
    const [halfwayAlertEnabled, setHalfwayAlertEnabled] = useState(false);
    const [filterCategory, setFilterCategory] = useState(null);
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

    const toggleDarkMode = async () => {
        try {
            const newTheme = !isDarkMode ? 'dark' : 'light';
            await AsyncStorage.setItem('theme', newTheme);
            setIsDarkMode(!isDarkMode);
        } catch (error) {
            console.log('Error toggling theme:', error);
        }
    };

    const intervalRefs = useRef({});

    const categories = [
        { label: 'Workout', value: 'Workout' },
        { label: 'Study', value: 'Study' },
        { label: 'Break', value: 'Break' },
    ];

    // Initialize all categories as expanded
    useEffect(() => {
        const initialExpandedCategories = categories.reduce((acc, category) => {
            acc[category.value] = true;
            return acc;
        }, {});
        setExpandedCategories(initialExpandedCategories);
    }, []);

    useEffect(() => {
        loadTimers();
        loadHistory();
    }, []);

    const saveTimer = async () => {
        if (!name || !duration || !category || isNaN(duration)) {
            Alert.alert('Please fill all fields and enter a valid number for seconds');
            return;
        }

        const newTimer = {
            id: Date.now().toString(),
            name,
            duration: parseInt(duration),
            remainingTime: parseInt(duration),
            status: 'Paused',
            category,
            halfwayAlertEnabled,
        };

        const updatedTimers = [...timers, newTimer];
        setTimers(updatedTimers);
        await AsyncStorage.setItem('timers', JSON.stringify(updatedTimers));
        setName('');
        setDuration('');
        setCategory('');
        setHalfwayAlertEnabled(false);
        setModalVisible(false);
    };

    const loadTimers = async () => {
        try {
            const storedTimers = await AsyncStorage.getItem('timers');
            if (storedTimers) {
                setTimers(JSON.parse(storedTimers));
            }
        } catch (error) {
            console.error('Failed to load timers', error);
        }
    };

    const loadHistory = async () => {
        try {
            const storedHistory = await AsyncStorage.getItem('history');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error('Failed to load history', error);
        }
    };

    const saveHistory = async (completedTimer) => {
        const newHistoryEntry = {
            name: completedTimer.name,
            completionTime: new Date().toLocaleString(),
        };

        const updatedHistory = [...history, newHistoryEntry];
        setHistory(updatedHistory);
        await AsyncStorage.setItem('history', JSON.stringify(updatedHistory));
    };

    const startTimer = (timerId) => {
        const updatedTimers = timers.map(timer => {
            if (timer.id === timerId && timer.status !== 'Completed') {
                if (!intervalRefs.current[timerId]) {
                    intervalRefs.current[timerId] = setInterval(() => {
                        updateTimer(timerId);
                    }, 1000);
                }
                return { ...timer, status: 'Running' };
            }
            return timer;
        });
        setTimers(updatedTimers);
    };

    const pauseTimer = (timerId) => {
        if (intervalRefs.current[timerId]) {
            clearInterval(intervalRefs.current[timerId]);
            intervalRefs.current[timerId] = null;
        }
        const updatedTimers = timers.map(timer => {
            if (timer.id === timerId) {
                return { ...timer, status: 'Paused' };
            }
            return timer;
        });
        setTimers(updatedTimers);
    };

    const resetTimer = (timerId) => {
        if (intervalRefs.current[timerId]) {
            clearInterval(intervalRefs.current[timerId]);
            intervalRefs.current[timerId] = null;
        }
        const updatedTimers = timers.map(timer => {
            if (timer.id === timerId) {
                return { ...timer, remainingTime: timer.duration, status: 'Paused' };
            }
            return timer;
        });
        setTimers(updatedTimers);
    };

    const updateTimer = (timerId) => {
        setTimers(prevTimers =>
            prevTimers.map(timer => {
                if (timer.id === timerId) {
                    if (timer.remainingTime > 1) {
                        if (timer.halfwayAlertEnabled && timer.remainingTime === Math.floor(timer.duration / 2)) {
                            Alert.alert('Halfway Alert', `You're halfway through the timer: ${timer.name}`);
                        }
                        return { ...timer, remainingTime: timer.remainingTime - 1 };
                    } else {
                        clearInterval(intervalRefs.current[timerId]);
                        intervalRefs.current[timerId] = null;
                        setCompletedTimerName(timer.name);
                        setCompletionModalVisible(true);
                        saveHistory(timer);
                        return { ...timer, remainingTime: 0, status: 'Completed' };
                    }
                }
                return timer;
            })
        );
    };

    const toggleCategory = (category) => {
        setExpandedCategories((prevExpanded) => ({
            ...prevExpanded,
            [category]: !prevExpanded[category],
        }));
    };

    const calculateProgress = (timer) => {
        return ((timer.duration - timer.remainingTime) / timer.duration) * 100;
    };

    const startAllTimersInCategory = (category) => {
        const updatedTimers = timers.map(timer => {
            if (timer.category === category && timer.status !== 'Completed') {
                if (!intervalRefs.current[timer.id]) {
                    intervalRefs.current[timer.id] = setInterval(() => {
                        updateTimer(timer.id);
                    }, 1000);
                }
                return { ...timer, status: 'Running' };
            }
            return timer;
        });
        setTimers(updatedTimers);
    };

    const pauseAllTimersInCategory = (category) => {
        const updatedTimers = timers.map(timer => {
            if (timer.category === category && intervalRefs.current[timer.id]) {
                clearInterval(intervalRefs.current[timer.id]);
                intervalRefs.current[timer.id] = null;
                return { ...timer, status: 'Paused' };
            }
            return timer;
        });
        setTimers(updatedTimers);
    };

    const resetAllTimersInCategory = (category) => {
        const updatedTimers = timers.map(timer => {
            if (timer.category === category) {
                if (intervalRefs.current[timer.id]) {
                    clearInterval(intervalRefs.current[timer.id]);
                    intervalRefs.current[timer.id] = null;
                }
                return { ...timer, remainingTime: timer.duration, status: 'Paused' };
            }
            return timer;
        });
        setTimers(updatedTimers);
    };

    const renderTimer = (timer) => {
        const progress = calculateProgress(timer);

        return (
            <View
                style={[
                    styles.timerCard,
                    {
                        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                        shadowColor: isDarkMode ? '#000000' : '#cccccc',
                    },
                ]}
            >
                <Text style={[styles.timerText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Name: {timer.name}</Text>
                <Text style={[styles.timerText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Remaining Time: {timer.remainingTime} seconds</Text>
                <Text style={[styles.timerText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Status: {timer.status}</Text>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>

                {timer.status !== 'Completed' && (
                    <View style={styles.timerControls}>
                        <Button
                            title={timer.status === 'Running' ? 'Pause' : 'Start'}
                            onPress={() => timer.status === 'Running' ? pauseTimer(timer.id) : startTimer(timer.id)}
                        />
                        <Button title="Reset" onPress={() => resetTimer(timer.id)} />
                    </View>
                )}
            </View>
        );
    };

    const groupTimersByCategory = () => {
        return timers.reduce((grouped, timer) => {
            const category = timer.category;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(timer);
            return grouped;
        }, {});
    };

    const renderGroupedTimers = () => {
        const groupedTimers = groupTimersByCategory();

        return Object.keys(groupedTimers).map((category) => {
            if (filterCategory && filterCategory !== 'All' && category !== filterCategory) return null;

            return (
                <View key={category} >
                    <TouchableOpacity onPress={() => toggleCategory(category)} style={styles.categoryHeader}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        <Icon name={expandedCategories[category] ? 'chevron-up' : 'chevron-down'} size={24} />
                    </TouchableOpacity>

                    <View style={styles.categoryControls}>
                        <Button title="Start All" onPress={() => startAllTimersInCategory(category)} />
                        <Button title="Pause All" onPress={() => pauseAllTimersInCategory(category)} />
                        <Button title="Reset All" onPress={() => resetAllTimersInCategory(category)} />
                    </View>

                    {expandedCategories[category] && (
                        <View>
                            {groupedTimers[category].map((timer) => (
                                <View key={timer.id}>
                                    {renderTimer(timer)}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            );
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
            <View
                style={[
                    styles.appBar,
                    {
                        backgroundColor: isDarkMode ? '#1F1F1F' : '#2196F3',
                    },
                ]}
            >
                <Text style={styles.appBarTitle}>Saved Timers</Text>
                <TouchableOpacity onPress={toggleDarkMode}>
                    <Icon name={isDarkMode ? 'sunny' : 'moon'} size={24} color="white" />
                </TouchableOpacity>
            </View>
            <ScrollView style={[styles.scrollView, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}
                contentContainerStyle={{
                    paddingBottom: 100
                }}
            >
                <Dropdown
                    style={[styles.input, {
                        borderColor: isDarkMode ? '#555' : '#000',
                    }]}
                    data={[{ label: 'All', value: 'All' }, ...categories]}
                    labelField="label"
                    valueField="value"
                    placeholder="Filter by Category"
                    placeholderStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                    value={filterCategory}
                    onChange={item => setFilterCategory(item.value)}
                />

                {renderGroupedTimers()}

                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}

                    >
                        <View
                            style={[styles.modalContent, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
                            <Text style={[styles.heading, { color: isDarkMode ? '#fff' : '#000' }]}>Create a New Timer</Text>

                            <TextInput
                                style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
                                placeholderTextColor={isDarkMode ? '#fff' : '#000'}
                                placeholder="Timer Name"
                                value={name}
                                onChangeText={setName}
                            />

                            <TextInput
                                style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
                                placeholderTextColor={isDarkMode ? '#fff' : '#000'}
                                placeholder="Enter Duration (in seconds)"
                                keyboardType="numeric"
                                value={duration}
                                onChangeText={setDuration}
                            />

                            <Dropdown
                                style={styles.input}
                                placeholderStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                                data={categories}
                                labelField="label"
                                valueField="value"
                                placeholder="Select Category"
                                value={category}
                                onChange={item => setCategory(item.value)}
                            />

                            <View style={styles.switchContainer}>
                                <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Enable Halfway Alert</Text>
                                <TouchableOpacity
                                    style={[styles.switch, halfwayAlertEnabled ? styles.switchOn : styles.switchOff]}
                                    onPress={() => setHalfwayAlertEnabled(!halfwayAlertEnabled)}
                                >
                                    <View style={[styles.switchToggle, halfwayAlertEnabled ? styles.switchToggleOn : styles.switchToggleOff]} />
                                </TouchableOpacity>
                            </View>

                            <Button title="Save Timer" onPress={saveTimer} />
                            <View style={{ marginTop: 10 }}>
                                <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
                            </View>

                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={completionModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setCompletionModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.heading}>🎉 Timer Completed! 🎉</Text>
                            <Text style={styles.timerText}>Congratulations! "{completedTimerName}" has finished.</Text>
                            <View style={{ marginTop: 10 }}>
                                <Button title="Close" onPress={() => setCompletionModalVisible(false)} />
                            </View>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Icon name="add" size={30} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.historyFab}
                onPress={() => navigation.navigate('History', { history })}
            >
                <Icon name="time-outline" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    appBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        elevation: 4,
    },
    appBarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    heading: {
        fontSize: 24,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    timerCard: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timerText: {
        fontSize: 16,
    },
    listHeading: {
        fontSize: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007AFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    historyFab: {
        position: 'absolute',
        right: 20,
        bottom: 90,
        backgroundColor: '#007AFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    timerControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        backgroundColor: '#eaeaea',
        paddingHorizontal: 15,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginVertical: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 5,
    },
    categoryControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    historyEntry: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    historyText: {
        fontSize: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    switch: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        padding: 2,
    },
    switchOn: {
        backgroundColor: '#007AFF',
    },
    switchOff: {
        backgroundColor: '#ccc',
    },
    switchToggle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
    },
    switchToggleOn: {
        alignSelf: 'flex-end',
    },
    switchToggleOff: {
        alignSelf: 'flex-start',
    },
});
export default MainScreen;