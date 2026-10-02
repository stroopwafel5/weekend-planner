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
  Platform,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Calendar } from 'react-native-calendars';

import attractions from './sofashs.json';

export default function SofashView() {
  const [showFilters, setShowFilters] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [titleFilter, setTitleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState(500);


  const resetFilters = () => {
    setTitleFilter('');
    setSelectedDate('');
    setShowCalendar(false);
    setMaxPrice(500);
    setTypeFilter('');
  };

  const types = [...new Set(attractions.map((item) => item.type).filter(Boolean))];

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const normalizeDate = (value) => {
  if (!value) return '';

  const parts = String(value).trim().split(/[-/.]/);

  if (parts.length !== 3) return String(value).trim();

  let [a, b, c] = parts;

  // если формат YYYY-MM-DD
  if (a.length === 4) {
    return `${c.padStart(2, '0')}-${b.padStart(2, '0')}-${a}`;
  }

  // если формат DD-MM-YYYY или DD/MM/YYYY
  return `${a.padStart(2, '0')}-${b.padStart(2, '0')}-${c}`;
};


  const filtered = attractions.filter((event) => {
      const title = event.nameH || event.nameR || '';
    const type = event.type || '';
    const price = Number(event.price ?? 0);
    const selectedDateString = selectedDate || '';

    return (

      title.toLowerCase().includes(titleFilter.toLowerCase()) &&
      (selectedDateString === '' || normalizeDate(event.date) === normalizeDate(selectedDateString)) &&
      (typeFilter === '' || type === typeFilter) &&
      price <= maxPrice
    );
  });

  const showAlert = () => {
    Alert.alert('Alert', 'Button pressed');
  };

  const renderItem = ({ item }) => (
    <View style={styles.box}>
      <Image style={styles.image} source={{ uri: item.image }} />

      <View style={styles.boxContent}>
        <Text style={styles.title}>{item.nameH}</Text>
        <Text style={styles.description}>{item.discrH}</Text>
        <Text style={styles.meta}>Date: {item.date}</Text>
        <Text style={styles.meta}>Price: {item.price} ₪</Text>

        <TouchableOpacity style={styles.button} onPress={showAlert}>
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title={showFilters ? 'החבא פילטרים' : 'ראה פילטרים'}
        color="#064e3b"
        onPress={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <View style={styles.filters}>


          <Text style={styles.label}>שם</Text>

        <TextInput
                    style={styles.searchBar}
                    placeholder="חפש לפי שם"
                    value={titleFilter}
                    onChangeText={setTitleFilter}
                  />

          <Text style={styles.label}>סוג האירוע</Text>



          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={typeFilter}
              onValueChange={(value) => setTypeFilter(value)}
              style={styles.picker}
            >
              <Picker.Item label="כל האירועים" value="" />
              {types.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>תאריך</Text>

          <TouchableOpacity
            style={styles.dateButton}
             onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={styles.dateButtonText}>

             {selectedDate ? selectedDate : 'חפש לפי תאריך'}

            </Text>
          </TouchableOpacity>

          {selectedDate && (
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <Text style={styles.clearText}>Clear date</Text>
            </TouchableOpacity>
          )}

          {showCalendar && (
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#064e3b',
                },
              }}
              theme={{
                backgroundColor: '#bbf7d0',
                calendarBackground: '#dcfce7',
                selectedDayBackgroundColor: '#064e3b',
                selectedDayTextColor: '#dcfce7',
                todayTextColor: '#064e3b',
                dayTextColor: '#064e3b',
                monthTextColor: '#064e3b',
                arrowColor: '#064e3b',
              }}
            />
          )}

          <Text style={styles.label}> מחיר מירבי  - {maxPrice} ₪</Text>

          <Slider
            minimumValue={0}
            maximumValue={500}
            step={10}
            value={maxPrice}
            onValueChange={setMaxPrice}
            minimumTrackTintColor="#064e3b"
            maximumTrackTintColor="#bbf7d0"
            thumbTintColor="#064e3b"
          />
             <Button
                        title={'מחק פילטרים'}
                        color="#064e3b"
                        onPress={() => resetFilters()}
                      />

        </View>

      )}

      <FlatList
        data={filtered}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={renderItem}
      />



    </View>
  );
}

const styles = StyleSheet.create({

      searchBar: {
        height: 40,
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
      },
      item: {
        fontSize: 18,
        padding: 10,
      },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#dcfce7',
  },
  filters: {
    padding: 12,
    backgroundColor: '#bbf7d0',

    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#064e3b',
    marginTop: 10,
    marginBottom: 6,

    textAlign: 'center',
  },
  pickerWrapper: {
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#064e3b',
    marginBottom: 8,

  minHeight: 50,
  lineHeight: 26,
  },
  picker: {
    color: '#064e3b',
  minHeight: 50,
  lineHeight: 26,

  },
  dateButton: {
    backgroundColor: '#064e3b',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#dcfce7',
    fontWeight: '700',
  },
  clearText: {
    color: '#064e3b',
    marginTop: 8,
    fontWeight: '600',
  },
  box: {
    padding: 16,
    margin: 8,
    backgroundColor: '#f0fdf4',
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  boxContent: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 22,
    color: '#064e3b',
    fontWeight: '800',
  minHeight: 50,
  lineHeight: 26,
  },
  description: {
    fontSize: 14,
    color: '#14532d',
    marginTop: 4,
  },
  meta: {
    fontSize: 13,
    color: '#166534',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#064e3b',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 15,
    width: 70,
    alignItems: 'center',
  },
  buttonText: {
    color: '#dcfce7',
    fontWeight: '700',
  },
});