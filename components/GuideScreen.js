import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import GUIDE_RANGES from './guideRanges'; // Kılavuz verileri

const determineAgeGroup = (ageDetails, guide) => {
  // ... (Yaş aralığı hesaplama fonksiyonu, değiştirilmeden kalabilir)
  const { years, months, days } = ageDetails;
  const guideAgeRanges = Object.keys(GUIDE_RANGES[guide]?.ageRanges || {});

  for (const range of guideAgeRanges) {
    const ageRange = GUIDE_RANGES[guide].ageRanges[range];
    const unit = ageRange.unit;

    let ageInUnit = 0;
    if (unit === 'days') {
      ageInUnit = years * 365 + months * 30 + days;
    } else if (unit === 'months') {
      ageInUnit = years * 12 + months + days / 30;
    } else if (unit === 'years') {
      ageInUnit = years + months / 12 + days / 365;
    }

    const [start, end] = range.split('-').map((v) =>
      v.includes('>') || v.includes('≥')
        ? parseInt(v.replace(/[^0-9]/g, ''), 10)
        : parseFloat(v)
    );

    if (range.includes('>') || range.includes('≥')) {
      if (ageInUnit >= start) return range;
    } else if (ageInUnit >= start && ageInUnit <= (end || ageInUnit)) {
      return range;
    }
  }

  return null;
};

const GuideScreen = () => {
  const [manualAge, setManualAge] = useState({ years: '', months: '', days: '' });
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [results, setResults] = useState([]);

  const handleCalculate = () => {
    if (!manualAge.years && !manualAge.months && !manualAge.days) {
      alert('Lütfen yaş bilgilerini tam girin.');
      return;
    }

    const ageDetails = {
      years: parseInt(manualAge.years) || 0,
      months: parseInt(manualAge.months) || 0,
      days: parseInt(manualAge.days) || 0,
    };

    if (!selectedGuide) {
      alert('Lütfen bir kılavuz seçin.');
      return;
    }

    const ageGroup = determineAgeGroup(ageDetails, selectedGuide);
    if (!ageGroup) {
      alert('Bu yaş grubu için kılavuz bulunamadı.');
      return;
    }

    const guideValues = GUIDE_RANGES[selectedGuide]?.ageRanges[ageGroup];
    if (!guideValues) {
      alert('Seçilen yaş grubu için kılavuz değeri bulunamadı.');
      return;
    }

    const newResults = Object.keys(guideValues).map((key) => {
      const inputValue = parseFloat(inputValues[key]);

      if (isNaN(inputValue)) {
        return { key, status: 'Bilinmiyor', icon: 'question', color: 'orange' };
      }

      const range = guideValues[key];
      if (!range) {
        return { key, status: 'Bilinmiyor', icon: 'question', color: 'orange' };
      }

      if (inputValue < range.min) {
        return { key, status: 'Düşük', icon: 'arrow-down', color: 'red' };
      } else if (inputValue > range.max) {
        return { key, status: 'Yüksek', icon: 'arrow-up', color: 'green' };
      } else {
        return { key, status: 'Normal', icon: 'minus', color: 'gray' };
      }
    });

    setResults(newResults);
  };

  const handleGuideChange = (guide) => {
    setSelectedGuide(guide);
    setInputValues({}); // Kılavuz değiştiğinde giriş alanlarını sıfırla
    setResults([]);     // Kılavuz değiştiğinde sonuçları sıfırla
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kılavuz Hesaplama</Text>

      {/* Yaş Bilgileri */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Yaş Bilgileri</Text>
        <View style={styles.ageInputRow}>
          <TextInput
            style={styles.ageInput}
            placeholder="Yıl"
            keyboardType="numeric"
            value={manualAge.years}
            onChangeText={(value) => setManualAge((prev) => ({ ...prev, years: value }))}
          />
          <TextInput
            style={styles.ageInput}
            placeholder="Ay"
            keyboardType="numeric"
            value={manualAge.months}
            onChangeText={(value) => setManualAge((prev) => ({ ...prev, months: value }))}
          />
          <TextInput
            style={styles.ageInput}
            placeholder="Gün"
            keyboardType="numeric"
            value={manualAge.days}
            onChangeText={(value) => setManualAge((prev) => ({ ...prev, days: value }))}
          />
        </View>
      </View>

      {/* Kılavuz Seçimi */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Kılavuz Seç</Text>
        <View style={styles.guideButtonRow}>
          {Object.keys(GUIDE_RANGES).map((guide) => (
            <TouchableOpacity
              key={guide}
              style={[
                styles.guideButton,
                selectedGuide === guide && styles.guideButtonSelected,
              ]}
              onPress={() => handleGuideChange(guide)}
            >
              <Text
                style={[
                  styles.guideButtonText,
                  selectedGuide === guide && styles.guideButtonTextSelected,
                ]}
              >
                {GUIDE_RANGES[guide].name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Değer Girişleri */}
      {selectedGuide &&
        Object.keys(GUIDE_RANGES[selectedGuide]?.referenceKeys || {}).length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Değerler</Text>
            {Object.keys(GUIDE_RANGES[selectedGuide].referenceKeys).map((key) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{key}</Text>
                <TextInput
                  style={styles.valueInput}
                  placeholder={`Değer (${GUIDE_RANGES[selectedGuide].referenceKeys[key]})`}
                  keyboardType="numeric"
                  value={inputValues[key] || ''}
                  onChangeText={(value) =>
                    setInputValues((prev) => ({ ...prev, [key]: value }))
                  }
                />
              </View>
            ))}
          </View>
        )}

      {/* Hesapla Butonu */}
      <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
        <Text style={styles.calculateButtonText}>Hesapla</Text>
      </TouchableOpacity>

      {/* Sonuçlar */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Sonuçlar</Text>
          {results.map((result) => (
            <View key={result.key} style={styles.resultItem}>
              <View style={styles.resultItemLeft}>
                <FontAwesome
                  name={result.icon}
                  size={22}
                  color={result.color}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.resultText}>
                  {result.key}
                </Text>
              </View>
              <Text style={[styles.resultStatus, { color: result.color }]}>
                {result.status}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default GuideScreen;

const styles = StyleSheet.create({
  // Ana kapsayıcı
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF9F3', // Açık turuncu arka plan
    padding: 20,
  },
  // Başlık
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
    color: '#f4511e', // Turuncu vurgu
    marginBottom: 25,
  },
  // Bölüm kapsayıcı
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f4511e',
    marginBottom: 10,
  },
  // Yaş girişi
  ageInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ageInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    marginHorizontal: 5,
    fontSize: 16,
    color: '#333',
  },
  // Kılavuz butonları
  guideButtonRow: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  guideButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 2, // Hafif gölge
  },
  guideButtonSelected: {
    backgroundColor: '#f4511e',
    borderColor: '#f4511e',
  },
  guideButtonText: {
    fontSize: 16,
    color: '#333',
  },
  guideButtonTextSelected: {
    color: '#fff',
  },
  // Değer girişi
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  valueInput: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  // Hesapla butonu
  calculateButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 20,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Sonuçlar
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f4511e',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  resultItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
});
