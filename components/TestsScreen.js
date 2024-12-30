import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from './firebase';

// İmmünoglobulin key’leri
const immunoKeys = ['IgA', 'IgM', 'IgG', 'IgG1', 'IgG2', 'IgG3', 'IgG4'];

/** 
 * Bir önceki testin değeri ile bu testin değerini karşılaştırıp
 * arrow-up (yeşil), arrow-down (kırmızı), minus (gri) veya question (turuncu) döndürür.
 */
const compareTests = (currentValue, previousValue) => {
  if (currentValue == null || previousValue == null) {
    return { icon: 'question', color: 'orange' };
  }
  const curr = parseFloat(currentValue);
  const prev = parseFloat(previousValue);
  if (isNaN(curr) || isNaN(prev)) {
    return { icon: 'question', color: 'orange' };
  }
  if (curr > prev) {
    return { icon: 'arrow-up', color: 'green' };
  } else if (curr < prev) {
    return { icon: 'arrow-down', color: 'red' };
  } else {
    return { icon: 'minus', color: 'gray' };
  }
};

const TestsScreen = ({ navigation }) => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [expandedTestId, setExpandedTestId] = useState(null);

  // Seçili immunoKey: null => tüm tahliller, 'IgA' => sadece IgA olanlar, vb.
  const [selectedKey, setSelectedKey] = useState(null);

  // Veri çekme
  useEffect(() => {
    let isMounted = true;

    const fetchTests = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigation.replace('Login');
          return;
        }

        const db = getDatabase();
        const testsRef = ref(db, 'tests');
        const snapshot = await get(testsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const allTests = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          // Sadece bu kullanıcıya ait tahlilleri çek.
          // Tarihe göre azalan sıralama (yeni tarih en üstte)
          const userTests = allTests
            .filter((test) => test.user_id === user.uid)
            .sort((a, b) => new Date(b.test_date) - new Date(a.test_date));

          if (isMounted) {
            setTests(userTests);
            setFilteredTests(userTests);
          }
        } else if (isMounted) {
          setTests([]);
          setFilteredTests([]);
        }
      } catch (err) {
        console.error('Hata:', err.message);
      }
    };

    fetchTests();
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  // Ig Key seçimi
  const handleSelectKey = (key) => {
    setSelectedKey(key);
    if (key === null) {
      // "Hepsi" veya "Temizle" => tüm testler
      setFilteredTests(tests);
      return;
    }

    // Key seçildiyse, test[key] != null olan testleri getir
    const newFiltered = tests.filter((item) => {
      // item[key] var mı
      return item[key] != null;
    });
    setFilteredTests(newFiltered);
  };

  // Test kartını aç/kapa
  const handleTestExpand = (testId) => {
    setExpandedTestId((prevId) => (prevId === testId ? null : testId));
  };

  // FlatList rendere edeceği her item için
  const renderItem = ({ item, index }) => {
    const isExpanded = expandedTestId === item.id;
    // Bir sonraki index "daha eski" test demek:
    const previousTest = filteredTests[index + 1] || null;

    return (
      <View style={styles.card}>
        {/* Üst kısım (tarih & chevron) */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => handleTestExpand(item.id)}
        >
          <Text style={styles.dateText}>
            {/* Örnek: "2023-08-01 Tarihli Tahlilim" */}
            {(item.test_date || 'Tarih Yok') + ' Tarihli Tahlilim'}
          </Text>
          <FontAwesome
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#333"
          />
        </TouchableOpacity>

        {/* Açılır içerik */}
        {isExpanded && (
          <View style={styles.cardBody}>
            {immunoKeys.map((key) => {
              // Bu testteki Ig… değeri varsa göster
              if (item[key] == null) return null;
              // Önceki testteki değer
              const prevVal = previousTest ? previousTest[key] : null;
              // Karşılaştırma
              const comp = compareTests(item[key], prevVal);

              return (
                <View key={key} style={styles.valueRow}>
                  <Text style={styles.valueLabel}>{key}:</Text>
                  <View style={styles.valueRight}>
                    <Text style={styles.valueText}>{item[key]}</Text>
                    <FontAwesome
                      name={comp.icon}
                      size={20}
                      color={comp.color}
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </View>
              );
            })}

            {/* Not alanı varsa göster */}
            {item.notes && item.notes.trim() !== '' && (
              <Text style={styles.notes}>Not: {item.notes}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Üst Bar (Başlık) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tahlillerim</Text>
      </View>

      {/* Filtre Seçimi */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* "Hepsi" seçeneği */}
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedKey === null && styles.filterButtonSelected,
              ]}
              onPress={() => handleSelectKey(null)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedKey === null && styles.filterButtonTextSelected,
                ]}
              >
                Hepsi
              </Text>
            </TouchableOpacity>

            {immunoKeys.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterButton,
                  selectedKey === key && styles.filterButtonSelected,
                ]}
                onPress={() => handleSelectKey(key)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedKey === key && styles.filterButtonTextSelected,
                  ]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* Tahliller Listesi */}
      {filteredTests.length > 0 ? (
        <FlatList
          data={filteredTests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Hiç tahlil kaydı yok veya seçilen değere sahip sonuç bulunamadı.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TestsScreen;

/** Stil tanımları */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F3', // Diğer ekranlarla uyumlu açık turuncu zemin
  },
  header: {
    backgroundColor: '#f4511e',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  // Filtre Container
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
    elevation: 2,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    elevation: 2,
  },
  filterButtonSelected: {
    backgroundColor: '#f4511e',
    borderColor: '#f4511e',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  filterButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  flatListContent: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  valueRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: '#333',
  },
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    marginHorizontal: 30,
    textAlign: 'center',
  },
});
