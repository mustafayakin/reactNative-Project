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
    setResults([]); // Kılavuz değiştiğinde sonuçları sıfırla
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yaş Bilgileri</Text>

      <View style={styles.manualAgeGroup}>
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

      <View style={styles.buttonGroup}>
        {Object.keys(GUIDE_RANGES).map((guide) => (
          <TouchableOpacity
            key={guide}
            style={selectedGuide === guide ? styles.selectedButton : styles.button}
            onPress={() => handleGuideChange(guide)}
          >
            <Text style={styles.buttonText}>{GUIDE_RANGES[guide].name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedGuide && Object.keys(GUIDE_RANGES[selectedGuide]?.referenceKeys || {}).length > 0 && (
        <View>
          {Object.keys(GUIDE_RANGES[selectedGuide]?.referenceKeys || {}).map((key) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{key}</Text>
              <TextInput
                style={styles.input}
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

      <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
        <Text style={styles.calculateButtonText}>Hesapla</Text>
      </TouchableOpacity>

      {results.length > 0 && (
        <View>
          <Text style={styles.resultsTitle}>Sonuçlar:</Text>
          {results.map((result) => (
            <View key={result.key} style={styles.resultItem}>
              <FontAwesome
                name={result.icon}
                size={24}
                color={result.color}
                style={styles.resultIcon}
              />
              <Text style={styles.resultText}>{`${result.key}: ${result.status}`}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#f4511e',
  },
  manualAgeGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ageInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
    margin: 5,
  },
  selectedButton: {
    padding: 10,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    margin: 5,
  },
  buttonText: {
    color: '#fff',
  },
  calculateButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultIcon: {
    marginRight: 10,
  },
  resultText: {
    fontSize: 16,
  },
});

export default GuideScreen;
