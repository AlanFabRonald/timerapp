import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
  PushNotificationIOS,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import PushNotification from 'react-native-push-notification';
import Icon from 'react-native-vector-icons/MaterialIcons';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'Low',
    category: 'Personal',
    completed: false,
    reminder: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');

  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);
      },
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    PushNotification.createChannel(
      {
        channelId: "default-channel-id",
        channelName: "Default Channel",
        channelDescription: "A default channel",
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
  }, []);

  const saveTasks = async (updatedTasks) => {
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const scheduleNotification = (task) => {
    if (task.reminder) {
      PushNotification.localNotificationSchedule({
        channelId: "default-channel-id",
        title: `Reminder: ${task.title}`,
        message: 'You have a task due soon!',
        date: task.dueDate,
      });
    }
  };

  const addOrEditTask = () => {
    if (newTask.title === '' || newTask.dueDate === '') {
      Alert.alert('Error', 'Please fill in the required fields.');
      return;
    }

    if (editingTaskId !== null) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingTaskId ? { ...task, ...newTask } : task
      );
      saveTasks(updatedTasks);
      scheduleNotification(newTask);
      setEditingTaskId(null);
    } else {
      const task = { ...newTask, id: Date.now().toString() };
      saveTasks([...tasks, task]);
      scheduleNotification(task);
    }

    setNewTask({
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 'Low',
      category: 'Personal',
      completed: false,
      reminder: false,
    });
    setModalVisible(false);
  };

  const confirmDeleteTask = (id) => {
    setTaskIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const deleteTask = () => {
    const updatedTasks = tasks.filter((task) => task.id !== taskIdToDelete);
    saveTasks(updatedTasks);
    setDeleteModalVisible(false);
    setTaskIdToDelete(null);
  };

  const toggleCompleted = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const editTask = (task) => {
    setNewTask(task);
    setEditingTaskId(task.id);
    setModalVisible(true);
  };

  const onChangeDateTime = (event, selectedDate) => {
    const currentDate = selectedDate || newTask.dueDate;

    if (mode === 'date') {
      setShowPicker(false);
      setMode('time');
      setShowPicker(true);
    } else {
      setShowPicker(false);
    }

    setNewTask({ ...newTask, dueDate: currentDate });
  };

  const showDateTimePicker = () => {
    setMode('date');
    setShowPicker(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFCCCB' }}>

      <View style={{ flex: 1 }}>
        <ScrollView >
          <View style={styles.appBar}>
            <Text style={styles.appBarTitle}>Task Manager</Text>
          </View>
          <View style={{ marginTop: 16, padding: 16 }}>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                      <TouchableOpacity onPress={() => editTask(task)} style={{ marginHorizontal: 20 }}>
                        <Icon name="edit" size={15} color="#900" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmDeleteTask(task.id)}>
                        <Icon name="delete" size={15} color="#900" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text>
                    Due: {new Date(task.dueDate).toLocaleDateString()} {new Date(task.dueDate).toLocaleTimeString()}
                  </Text>
                  <Text>Priority: {task.priority}</Text>
                  <Text>Category: {task.category}</Text>
                  <Text>Reminder: {task.reminder ? 'On' : 'Off'}</Text>
                  {task.description ? <Text>Description: {task.description}</Text> : null}
                </View>
                <View style={styles.completedContainer}>
                  <Text style={styles.completedText}>Completed:</Text>
                  <Switch
                    value={task.completed}
                    onValueChange={() => toggleCompleted(task.id)}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <View style={styles.addButtonText}><Icon name="add" size={20} color="#fff" /></View>
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.headerText}>{editingTaskId ? 'Edit Task' : 'Add Task'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Title (Required)"
              placeholderTextColor={"#000"}
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (Optional)"
              placeholderTextColor={"#000"}
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
            />
            <TouchableOpacity onPress={showDateTimePicker}>
              <Text style={styles.input}>
                Due Date: {newTask.dueDate.toLocaleString()}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={newTask.dueDate instanceof Date ? newTask.dueDate : new Date()}
                mode={mode}
                display="default"
                onChange={onChangeDateTime}
              />
            )}

            <Text style={styles.label}>Priority:</Text>
            <View style={styles.radioGroup}>
              {['Low', 'Medium', 'High'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={styles.radioButton}
                  onPress={() => setNewTask({ ...newTask, priority: level })}
                >
                  <View style={styles.radioCircle}>
                    {newTask.priority === level && <View style={styles.selectedRb} />}
                  </View>
                  <Text>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Category:</Text>
            <View style={styles.radioGroup}>
              {['Work', 'Personal'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.radioButton}
                  onPress={() => setNewTask({ ...newTask, category: cat })}
                >
                  <View style={styles.radioCircle}>
                    {newTask.category === cat && <View style={styles.selectedRb} />}
                  </View>
                  <Text>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.reminderContainer}>
              <Text style={styles.label}>Set Reminder:</Text>
              <Switch
                value={newTask.reminder}
                onValueChange={(value) => setNewTask({ ...newTask, reminder: value })}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={addOrEditTask}>
              <Text style={styles.buttonText}>{editingTaskId ? 'Edit Task' : 'Add Task'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={deleteModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.headerText}>Are you sure you want to delete this task?</Text>
            <TouchableOpacity style={styles.button} onPress={deleteTask}>
              <Text style={styles.buttonText}>Yes, Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setDeleteModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = {
  input: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#FF6666',
    padding: 8,
    color: '#000',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    marginVertical: 8,
    fontWeight: 'bold',
    color: '#000',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF6666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6666',
  },
  button: {
    backgroundColor: '#FF6666',
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerText: {
    color: '#FF0000',
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft:5,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF6666',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskCard: {
    padding: 16,
    borderRadius: 5,
    backgroundColor: '#FFE5E5',
    marginBottom: 10,
    elevation: 1,
  },
  taskInfo: {
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  taskCompleted: {
    fontStyle: 'italic',
    color: '#000',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    color: '#FF6666',
  },
  deleteButton: {
    color: '#FF0000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#FFCCCB',
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FF0000',
  },
  appBar: {
    height: 60,
    backgroundColor: '#FF6F61',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },

  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completedText: {
    fontSize: 16,
  },
};

export default App;