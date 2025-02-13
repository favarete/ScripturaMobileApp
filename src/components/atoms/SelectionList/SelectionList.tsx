import type { SupportedLanguages } from '@/hooks/language/schema';

import FeatherIcons from '@react-native-vector-icons/feather';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

type OptionsType = {
  code: SupportedLanguages;
  name: string;
};

type Props = {
  modalTitle: string;
  onSelect: (newSelected: OptionsType['code']) => void;
  options: OptionsType[];
  selectedOption: OptionsType['code'];
  title: string;
};

function SelectionList({
  modalTitle,
  onSelect,
  options,
  selectedOption,
  title,
}: Props) {
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (modalVisible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          duration: 300,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          duration: 300,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          duration: 300,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          duration: 300,
          toValue: 50,
          useNativeDriver: true,
        }),
      ]);
    }
  }, [fadeAnim, modalVisible, slideAnim]);

  const handleSelect = (language: OptionsType['code']) => {
    onSelect(language);
    setModalVisible(false);
  };

  const getOptionName = (code: OptionsType['code']): string => {
    return options.find((item) => item.code === code)?.name || '';
  };

  const styles = StyleSheet.create({
    closeButton: {
      ...gutters.marginTop_12,
      ...gutters.paddingHorizontal_20,
      ...gutters.paddingVertical_12,
    },
    info: {
      ...fonts.defaultFontFamilySemibold,
      ...fonts.gray800,
      ...fonts.size_16,
    },
    itemContainer: {
      ...layout.itemsCenter,
      ...layout.row,
      ...layout.justifyBetween,
      ...gutters.marginVertical_8,
      ...gutters.marginHorizontal_16,
      ...gutters.paddingHorizontal_16,
      ...gutters.paddingVertical_8,
      ...borders.rounded_4,
      backgroundColor: colors.full,
    },
    label: {
      ...fonts.defaultFontFamilyRegular,
      ...fonts.gray800,
      ...fonts.size_16,
    },
    languageOption: {
      ...layout.itemsCenter,
      ...gutters.padding_12,
      width: '100%',
    },
    languageText: {
      ...fonts.defaultFontFamilyRegular,
      ...fonts.size_16,
      color: colors.fullOpposite,
    },
    modalContainer: {
      ...layout.itemsCenter,
      ...borders.rounded_4,
      ...gutters.padding_20,
      backgroundColor: colors.full,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { height: 2, width: 0 },
      shadowOpacity: 0.2,
      width: 300,
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalTitle: {
      ...fonts.defaultFontFamilySemibold,
      ...fonts.gray800,
      ...fonts.size_16,
      ...gutters.marginBottom_12,
    },
    selectedOption: {
      ...borders.rounded_4,
      backgroundColor: colors.purple100,
    },
    selectorButton: {
      ...borders.rounded_4,
      ...gutters.paddingHorizontal_16,
      ...gutters.paddingVertical_8,
      backgroundColor: colors.purple100,
    },
    selectorText: {
      ...fonts.defaultFontFamilySemibold,
      ...fonts.size_16,
      color: colors.fullOpposite,
    },
  });

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.label}>{title}</Text>
      <View style={layout.itemsCenter}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.selectorButton}
        >
          <Text style={styles.selectorText}>
            {getOptionName(selectedOption)}
          </Text>
        </TouchableOpacity>
        <Modal animationType="none" transparent visible={modalVisible}>
          <View
            style={[layout.flex_1, layout.justifyCenter, layout.itemsCenter]}
          >
            <Animated.View
              onTouchEnd={() => setModalVisible(false)}
              style={[styles.modalOverlay, { opacity: fadeAnim }]}
            />
            <Animated.View
              style={[
                styles.modalContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <FlatList
                data={options}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.code)}
                    style={[
                      styles.languageOption,
                      selectedOption === item.code && styles.selectedOption,
                    ]}
                  >
                    <Text style={styles.languageText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <FeatherIcons color={colors.red500} name={'x'} size={30} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

export default SelectionList;
