import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';

const UserProfileScreen = () => {
  const [userIdInput, setUserIdInput] = useState('');
  
  // Tüm kullanıcılar
  const [allUsers, setAllUsers] = useState([]);
  
  // Filtrelenmiş kullanıcılar (arama sonucu)
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Listeyi göster/gizle
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [tests, setTests] = useState([]);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [editTest, setEditTest] = useState(null);

  // Sayfa ilk açıldığında veya yenilendiğinde kullanıcıları çek
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersArray = Object.keys(usersData).map((key) => ({
          id: key,
          ...usersData[key],
        }));
        // Örnek olarak yetki_id === 0 olanlar hasta
        const patientsArray = usersArray.filter((user) => user.yetki_id === 0);
        setAllUsers(patientsArray);
        setFilteredUsers(patientsArray);
      }
    });
  }, []);

  // Arama fonksiyonu
  const handleUserSearch = (value) => {
    setUserIdInput(value);

    // Eğer kullanıcı bir şey yazıyorsa dropdown aç
    if (value.trim()) {
      setShowDropdown(true);
      // Filtreleme
      const filtered = allUsers.filter((user) =>
        user.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setShowDropdown(false);
      setFilteredUsers(allUsers);
    }
  };

  // Hasta seçilince
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserIdInput(user.name);
    setShowDropdown(false);  // Listeyi kapat

    const db = getDatabase();
    const testsRef = ref(db, 'tests');
    onValue(testsRef, (snapshot) => {
      const testsData = snapshot.val();
      if (testsData) {
        const userTests = Object.keys(testsData)
          .map((key) => ({
            id: key,
            ...testsData[key],
          }))
          .filter((test) => test.user_id === user.id)
          .sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
        setTests(userTests);
      } else {
        setTests([]);
      }
    });
  };

  // Temizle butonu
  const handleClearSelection = () => {
    setSelectedUser(null);
    setUserIdInput('');
    setTests([]);
    setExpandedTestId(null);
    // Tüm listeyi tekrar göster
    setFilteredUsers(allUsers);
    setShowDropdown(false);
  };

  // Tahlil detayı aç/kapa
  const handleTestExpand = (testId) => {
    setExpandedTestId(expandedTestId === testId ? null : testId);
  };

  // Tahlil düzenle
  const handleEdit = (test) => {
    setEditTest(test);
  };

  // Tahlil sil
  const handleDelete = (testId) => {
    const db = getDatabase();
    const testRef = ref(db, `tests/${testId}`);
    remove(testRef)
      .then(() => alert('Tahlil başarıyla silindi!'))
      .catch((error) => alert(`Hata: ${error.message}`));
  };

  // Düzenlenen tahlili kaydet
  const handleSaveEdit = () => {
    if (!editTest) return;

    const db = getDatabase();
    const testRef = ref(db, `tests/${editTest.id}`);
    update(testRef, editTest)
      .then(() => {
        alert('Tahlil başarıyla güncellendi!');
        setEditTest(null);
        // Düzenleme bittiğinde her şeyi temizle
        handleClearSelection();
      })
      .catch((error) => alert(`Hata: ${error.message}`));
  };

  /**
   * Tahlil değerlerini bir önceki tahlil ile karşılaştır.
   * - İlk tahlil (önceki yok) => gri tire (-)
   * - Değerler null => turuncu soru işareti (?)
   * - Artış => yeşil yukarı ok
   * - Azalış => kırmızı aşağı ok
   * - Aynı => gri tire (-)
   */
  const compareTests = (currentValue, previousValue, isFirstTest) => {
    // Eğer bu test ilk tahlilse
    if (isFirstTest) {
      return <FontAwesome name="minus" size={20} color="gray" />;
    }
    // Herhangi bir değer null ise
    if (currentValue == null || previousValue == null) {
      return <FontAwesome name="question" size={20} color="orange" />;
    }
    // String veya number olarak gelebilir, sayıya çeviriyoruz
    const current = parseFloat(currentValue);
    const previous = parseFloat(previousValue);

    // parseFloat bir sayı döndüremezse NaN olur, yine soru işareti gösterelim
    if (isNaN(current) || isNaN(previous)) {
      return <FontAwesome name="question" size={20} color="orange" />;
    }

    if (current > previous) {
      return <FontAwesome name="arrow-up" size={20} color="green" />;
    } else if (current < previous) {
      return <FontAwesome name="arrow-down" size={20} color="red" />;
    } else {
      // Eşitse
      return <FontAwesome name="minus" size={20} color="gray" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hasta Seç</Text>

      <TextInput
        style={styles.input}
        placeholder="Hasta adı girin"
        value={userIdInput}
        onChangeText={handleUserSearch}
      />

      {/* Arama sonuçları (dropdown) */}
      {showDropdown && filteredUsers.length > 0 && (
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

      {/* Seçilen hasta bilgisi */}
      {selectedUser && (
        <View style={styles.selectedUserContainer}>
          <Text style={styles.selectedUser}>
            Seçilen Hasta: {selectedUser.name}
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearSelection}>
            <Text style={styles.clearButtonText}>Temizle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit modu aktifse düzenleme formu */}
      {editTest ? (
        <ScrollView style={styles.editContainer}>
          <Text style={styles.editTitle}>
            {editTest.test_date} Tarihli Tahlili Düzenle
          </Text>
          
          {/* Tüm Ig... alanları */}
          {Object.keys(editTest)
            .filter((key) => key.startsWith('Ig'))
            .map((key) => (
              <View key={key} style={styles.formRow}>
                <Text style={styles.formLabel}>{key}:</Text>
                <TextInput
                  style={styles.formInput}
                  value={editTest[key] == null ? '' : editTest[key].toString()}
                  keyboardType="numeric"
                  onChangeText={(value) =>
                    setEditTest((prev) => ({ ...prev, [key]: value }))
                  }
                />
              </View>
            ))}

          {/* Notes (Notlar) alanı */}
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Notlar:</Text>
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
              multiline
              value={editTest.notes || ''}
              onChangeText={(value) =>
                setEditTest((prev) => ({ ...prev, notes: value }))
              }
            />
          </View>

          {/* Kaydet butonu */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        // Eğer test listesi varsa listeyi göster
        tests.length > 0 ? (
          <FlatList
            data={tests}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              // Bir sonraki index, kronolojik olarak bir önceki tahlil demek
              // (Çünkü sort işlemi descending: en yeni test başta)
              const previousTest = tests[index + 1] || {};
              // isFirstTest: Listedeki son eleman, yani en eski test
              // (index, 0’dan başlıyor, tests.length -1 demek en son test)
              const isFirstTest = index === tests.length - 1;

              return (
                <View style={styles.testContainer}>
                  <Text style={styles.testDate}>
                    {item.test_date} Tarihli Tahlil
                  </Text>

                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => handleTestExpand(item.id)}
                  >
                    <Text style={styles.expandButtonText}>
                      {expandedTestId === item.id ? 'Daralt' : 'Detay Göster'}
                    </Text>
                  </TouchableOpacity>

                  {expandedTestId === item.id && (
                    <View style={styles.expandedSection}>
                      {/* Tüm Ig... alanlarını listele */}
                      {Object.keys(item)
                        .filter((key) => key.startsWith('Ig'))
                        .map((key) => (
                          <View key={key} style={styles.testRow}>
                            <Text style={styles.testKey}>{key}:</Text>
                            <Text style={styles.testValue}>
                              {item[key] == null ? '?' : item[key]}
                            </Text>
                            {/* Karşılaştırma ikonu */}
                            {compareTests(
                              item[key],
                              previousTest[key],
                              isFirstTest
                            )}
                          </View>
                        ))}
                      
                      {/* Notlar alanı */}
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesLabel}>Not:</Text>
                        <Text style={styles.notesText}>
                          {item.notes || 'Yok'}
                        </Text>
                      </View>

                      {/* Düzenle ve sil butonları */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEdit(item)}
                        >
                          <Text style={styles.actionText}>Düzenle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDelete(item.id)}
                        >
                          <Text style={styles.actionText}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
            style={styles.scrollableList}
          />
        ) : (
          // Seçili hasta var ama tahlil yok
          selectedUser && <Text style={styles.noTestText}>Tahlil yok.</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Ana container
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  
  // "Hasta Seç" label
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  
  // Hasta arama input
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  
  // Arama sonuçları listesi
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
  
  // Seçilen hasta gösterimi
  selectedUserContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#ff0000',
    padding: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Tahlil kartı
  testContainer: {
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  testDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expandButton: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#6200ee',
    padding: 8,
    borderRadius: 8,
  },
  expandButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  expandedSection: {
    marginTop: 10,
  },
  testRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testKey: {
    flex: 1,
    fontWeight: 'bold',
    color: '#444',
  },
  testValue: {
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
    color: '#444',
  },
  
  // Notlar
  notesContainer: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  notesLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#444',
  },
  notesText: {
    fontStyle: 'italic',
    color: '#444',
  },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  editButton: {
    backgroundColor: '#ffcc00',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Düzenleme ekranı
  editContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  formRow: {
    flexDirection: 'column',
    marginBottom: 15,
  },
  formLabel: {
    marginBottom: 5,
    fontWeight: '600',
    color: '#555',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Diğer
  scrollableList: {
    marginTop: 10,
  },
  noTestText: {
    fontStyle: 'italic',
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default UserProfileScreen;
