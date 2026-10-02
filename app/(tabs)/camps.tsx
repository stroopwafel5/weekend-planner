import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Calendar } from 'react-native-calendars';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import camps from './camps.json';

export default function SofashView() {
  const [showFilters, setShowFilters] = useState(true);
  const [titleFilter, setTitleFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [ageValues, setAgeValues] = useState([5, 21]);
  const [maxPrice, setMaxPrice] = useState(8000);

  const resetFilters = () => {
    setTitleFilter('');
    setCountryFilter('');
    setSelectedStartDate('');
    setSelectedEndDate('');
    setShowStartCalendar(false);
    setShowEndCalendar(false);
    setAgeValues([5, 21]);
    setMaxPrice(8000);
  };

  const countries = [...new Set(camps.map((item) => item.country).filter(Boolean))];

  const normalizeDate = (value) => {
    if (!value) return '';

    const parts = String(value).trim().split(/[-/.]/);
    if (parts.length !== 3) return String(value).trim();

    let [a, b, c] = parts;

    if (a.length === 4) {
      return `${c.padStart(2, '0')}-${b.padStart(2, '0')}-${a}`;
    }

    return `${a.padStart(2, '0')}-${b.padStart(2, '0')}-${c}`;
  };

  const filtered = camps.filter((camp) => {
    const title = camp.title || '';
    const country = camp.country || '';
    const price = Number(camp.price ?? 0);

    const campMinAge = Number(camp.minAge ?? camp.age ?? 0);
    const campMaxAge = Number(camp.maxAge ?? camp.max_age ?? camp.age ?? 99);

    return (
      title.toLowerCase().includes(titleFilter.toLowerCase()) &&
      (countryFilter === '' || country === countryFilter) &&
      price <= maxPrice &&
      campMaxAge >= ageValues[0] &&
      campMinAge <= ageValues[1] &&
      (selectedStartDate === '' ||
        normalizeDate(camp.date) === normalizeDate(selectedStartDate)) &&
      (selectedEndDate === '' ||
        normalizeDate(camp.end_date) === normalizeDate(selectedEndDate))
    );
  });

  const openCampLink = (link) => {
    if (!link) {
      Alert.alert('No link', 'This camp has no link');
      return;
    }

    Linking.openURL(link);
  };

  const renderItem = ({ item }) => (
    <View style={styles.box}>
      {item.image ? (
        <Image style={styles.image} source={{ uri: item.image }} />
      ) : null}

      <View style={styles.boxContent}>
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.meta}>
          <Text style={styles.boldText}>
            {item.date} - {item.end_date}
          </Text>

        </Text>

        <Text style={styles.description}>{item.description}</Text>

        <Text style={styles.meta}>
           {item.age } - {item.max_age} לגילאי
        </Text>

        <Text style={styles.meta}>{item.price} החל מ  ₪</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => openCampLink(item.link)}
        >
          <Text style={styles.buttonText}>View camp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topButton}>
        <Button
          title={showFilters ? 'החבא פילטרים' : 'הצג פילטרים'}
          color="#ea580c"
          onPress={() => setShowFilters(!showFilters)}
        />
      </View>

      {showFilters && (
        <View style={styles.filters}>
          <Text style={styles.label}>שם</Text>

          <TextInput
            style={styles.searchBar}
            placeholder="חפשו לפי שם"
            placeholderTextColor="#c2410c"
            value={titleFilter}
            onChangeText={setTitleFilter}
          />

          <Text style={styles.label}>מדינה</Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={countryFilter}
              onValueChange={(value) => setCountryFilter(value)}
              style={styles.picker}
            >
              <Picker.Item label="כל המדינות" value="" />
              {countries.map((country) => (
                <Picker.Item key={country} label={country} value={country} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>תאריך יציאה</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartCalendar(!showStartCalendar)}
          >
            <Text style={styles.dateButtonText}>
              {selectedStartDate ? selectedStartDate : 'בחרו תאריך יציאה'}
            </Text>
          </TouchableOpacity>

          {selectedStartDate ? (
            <TouchableOpacity onPress={() => setSelectedStartDate('')}>
              <Text style={styles.clearText}>Clear date</Text>
            </TouchableOpacity>
          ) : null}

          {showStartCalendar && (
            <Calendar
              onDayPress={(day) => {
                setSelectedStartDate(day.dateString);
                setShowStartCalendar(false);
              }}
              markedDates={{
                [selectedStartDate]: {
                  selected: true,
                  selectedColor: '#ea580c',
                },
              }}
            />
          )}

          <Text style={styles.label}>תאריך חזרה</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndCalendar(!showEndCalendar)}
          >
            <Text style={styles.dateButtonText}>
              {selectedEndDate ? selectedEndDate : 'בחרו תאריך חזרה'}
            </Text>
          </TouchableOpacity>

          {selectedEndDate ? (
            <TouchableOpacity onPress={() => setSelectedEndDate('')}>
              <Text style={styles.clearText}>Clear date</Text>
            </TouchableOpacity>
          ) : null}

          {showEndCalendar && (
            <Calendar
              onDayPress={(day) => {
                setSelectedEndDate(day.dateString);
                setShowEndCalendar(false);
              }}
              markedDates={{
                [selectedEndDate]: {
                  selected: true,
                  selectedColor: '#ea580c',
                },
              }}
            />
          )}

          <Text style={styles.label}> מחיר מירבי - {maxPrice} ₪ </Text>

          <View style={styles.sliderWrapper}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={8000}
              step={10}
              value={maxPrice}
              onValueChange={setMaxPrice}
              minimumTrackTintColor="#ea580c"
              maximumTrackTintColor="#fed7aa"
              thumbTintColor="#ea580c"
            />
          </View>

          <Text style={styles.label}>טווח גילאים</Text>

          <Text style={styles.value}>
            {ageValues[0]} – {ageValues[1]}
          </Text>

          <View style={styles.multiSliderWrapper}>
            <MultiSlider
              values={ageValues}
              min={5}
              max={21}
              step={1}
              onValuesChange={setAgeValues}
              selectedStyle={{ backgroundColor: '#ea580c' }}
              unselectedStyle={{ backgroundColor: '#fed7aa' }}
              markerStyle={{ backgroundColor: '#ea580c' }}
              sliderLength={260}
            />
          </View>

          <Button title="מחק פילטרים" color="#ea580c" onPress={resetFilters} />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff7ed',
  },

  topButton: {
    marginBottom: 10,
    alignSelf: 'center',
    width: '100%',
  },

  filters: {
    padding: 12,
    backgroundColor: '#ffedd5',
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
  },

  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7c2d12',
    marginTop: 8,
    marginBottom: 5,
    textAlign: 'center',
  },

  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c2d12',
    marginBottom: 8,
    textAlign: 'center',
  },

  searchBar: {
    height: 40,
    width: '100%',
    borderWidth: 1,
    borderColor: '#fb923c',
    backgroundColor: '#fff7ed',
    marginBottom: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    color: '#7c2d12',
    textAlign: 'center',
  },

  pickerWrapper: {
    width: '100%',
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fb923c',
    marginBottom: 8,
    minHeight: 45,
    justifyContent: 'center',
  },

  picker: {
    color: '#7c2d12',
    minHeight: 45,
    textAlign: 'center',
  },

  dateButton: {
    width: '100%',
    backgroundColor: '#ea580c',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  dateButtonText: {
    color: '#fff7ed',
    fontWeight: '700',
    textAlign: 'center',
  },

  clearText: {
    color: '#ea580c',
    marginTop: 6,
    fontWeight: '700',
    textAlign: 'center',
  },

  sliderWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  slider: {
    width: '100%',
  },

  multiSliderWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  list: {
    paddingBottom: 24,
  },

  box: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginBottom: 12,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#fed7aa',
  },

  boxContent: {
    padding: 12,
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    color: '#7c2d12',
    fontWeight: '800',
    marginBottom: 5,
    textAlign: 'center',
  },

  description: {
    fontSize: 13,
    color: '#9a3412',
    marginBottom: 6,
    textAlign: 'center',
  },

  meta: {
    fontSize: 12,
    color: '#c2410c',
    marginTop: 3,
    textAlign: 'center',
  },

  boldText: {
    fontWeight: '800',
    color: '#7c2d12',
  },

  button: {
    backgroundColor: '#ea580c',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 140,
  },

  buttonText: {
    color: '#fff7ed',
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
  },
});