import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getDatabase, ref, onValue } from 'firebase/database';

const UserProfileScreen = () => {
  const [userId, setUserId] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTests, setUserTests] = useState([]);
  const [expandedTest, setExpandedTest] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data)
          .map((key) => ({
            id: key,
            name: data[key].name,
            yetki_id: data[key].yetki_id,
          }))
          .filter((user) => user.yetki_id === 0);
        setAllUsers(usersArray);
      }
    });
  }, []);

  const handleUserSearch = (value) => {
    setUserId(value);
    const results = allUsers.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(results);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserId(user.name);
    setFilteredUsers([]);
    fetchUserTests(user.id);
  };

  const fetchUserTests = (userId) => {
    const db = getDatabase();
    const testsRef = ref(db, 'tests');
    onValue(testsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userTests = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .filter((test) => test.user_id === userId)
          .sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
        setUserTests(userTests);
      } else {
        setUserTests([]);
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setUserId('');
    setUserTests([]);
    setExpandedTest(null);
  };

  const calculateTrend = (current, previous) => {
    if (current === "" || current === undefined || current === null) return '?';
    if (previous === "" || previous === undefined || previous === null) return 'up';
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'same';
  };

  const renderTestDetails = (test, index) => {
    const previousTest = userTests[index + 1];
    const keys = ['IgG', 'IgG1', 'IgG2', 'IgG3', 'IgG4', 'IgA', 'IgA1', 'IgA2', 'IgM'];

    return (
      <View>
        {keys.map((key) => {
          const trend = calculateTrend(test[key], previousTest?.[key]);
          const value = test[key] === "" || test[key] === undefined || test[key] === null ? '?' : test[key];
          return (
            <View key={key} style={styles.detailRow}>
              <Text style={styles.detailKey}>{key}</Text>
              <Text style={styles.detailValue}>{value}</Text>
              {trend !== '?' && (
                <FontAwesome
                  name={
                    trend === 'up'
                      ? 'arrow-up'
                      : trend === 'down'
                      ? 'arrow-down'
                      : 'minus'
                  }
                  size={20}
                  color={
                    trend === 'up'
                      ? 'green'
                      : trend === 'down'
                      ? 'red'
                      : 'gray'
                  }
                />
              )}
            </View>
          );
        })}
        {test.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Not:</Text>
            <Text style={styles.notesText}>{test.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hasta Seç</Text>
      <TextInput
        style={styles.input}
        placeholder="Hasta adı girin"
        value={userId}
        onChangeText={handleUserSearch}
      />
      {filteredUsers.length > 0 && (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => handleUserSelect(item)}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
        />
      )}

      {selectedUser && (
        <View style={styles.selectedUserContainer}>
          <Text style={styles.selectedUser}>
            Seçilen Hasta: {selectedUser.name}
          </Text>
          <TouchableOpacity onPress={handleClearSelection}>
            <Text style={styles.clearButton}>Temizle</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedUser && userTests.length === 0 ? (
        <Text style={styles.noTests}>Bu hasta için tahlil yok.</Text>
      ) : (
        <FlatList
          data={userTests}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.testItem}>
              <TouchableOpacity
                onPress={() =>
                  setExpandedTest(expandedTest === item.id ? null : item.id)
                }
              >
                <Text style={styles.testDate}>
                  {item.test_date} - Tarihli Tahlil
                </Text>
              </TouchableOpacity>
              {expandedTest === item.id && (
                <View style={styles.testDetails}>
                  {renderTestDetails(item, index)}
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dropdown: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedUserContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedUser: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    color: 'red',
    fontSize: 16,
  },
  noTests: {
    fontSize: 16,
    color: 'red',
    marginTop: 20,
  },
  testItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  testDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  testDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailKey: {
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
  notesContainer: {
    marginTop: 10,
  },
  notesLabel: {
    fontWeight: 'bold',
  },
  notesText: {
    marginTop: 5,
  },
});

export default UserProfileScreen;
