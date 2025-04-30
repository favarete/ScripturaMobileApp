import type {
  ListRenderItemInfo,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  TextStyle,
} from 'react-native';

import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

const BASE = 16;
const LH = BASE * 1.25;

function styleFor(line: string): TextStyle {
  if (line.startsWith('### ')) {
    return {
      fontSize: BASE * 1.25,
      fontWeight: '700',
      includeFontPadding: false,
      lineHeight: BASE * 1.5,
      paddingTop: 2, // micro-ajuste
    };
  }
  if (line.startsWith('## ')) {
    return {
      fontSize: BASE * 1.5,
      fontWeight: '700',
      includeFontPadding: false,
      lineHeight: BASE * 1.75,
      paddingTop: 1,
    };
  }
  if (line.startsWith('# ')) {
    return {
      fontSize: BASE * 2,
      fontWeight: '700',
      includeFontPadding: false,
      lineHeight: BASE * 2.25,
    };
  }
  if (line.startsWith('> ')) {
    return {
      borderLeftColor: '#ccc',
      borderLeftWidth: 4,
      color: '#555',
      fontSize: BASE,
      fontStyle: 'italic',
      includeFontPadding: false,
      lineHeight: LH,
      paddingLeft: 8,
    };
  }
  return { fontSize: BASE, includeFontPadding: false, lineHeight: LH };
}

export default function MarkdownEditor(): JSX.Element {
  const [lines, setLines] = useState<string[]>(['']);

  /** Armazena refs de cada TextInput indexado pela linha */
  const inputsRef = useRef<Record<number, null | TextInput>>({});

  /** Insere nova linha logo abaixo da atual */
  const insertLineBelow = useCallback(
    (index: number, first = '', rest = '') => {
      setLines((prev) => {
        const next = [...prev];
        next[index] = first;
        next.splice(index + 1, 0, rest);
        return next;
      });
      // foco na nova linha
      setTimeout(() => inputsRef.current[index + 1]?.focus(), 0);
    },
    [],
  );

  /** Junta linha vazia com a anterior (Backspace) */
  const joinWithPrevious = useCallback((index: number) => {
    if (index === 0) {
      return;
    }
    setLines((prev) => {
      const next = [...prev];
      next[index - 1] += next[index];
      next.splice(index, 1);
      return next;
    });
    setTimeout(() => inputsRef.current[index - 1]?.focus(), 0);
  }, []);

  /** onChangeText: quebra em nova linha se contiver \n */
  const handleChange = useCallback(
    (index: number, text: string) => {
      if (text.includes('\n')) {
        const [before, ...rest] = text.split(/\n/);
        insertLineBelow(index, before, rest.join('\n'));
      } else {
        setLines((prev) => {
          const next = [...prev];
          next[index] = text;
          return next;
        });
      }
    },
    [insertLineBelow],
  );

  /** onKeyPress: junta com a anterior se backspace em linha vazia */
  const handleKeyPress = useCallback(
    (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Backspace' && lines[index] === '') {
        joinWithPrevious(index);
      }
    },
    [lines, joinWithPrevious],
  );

  /** renderItem do FlatList */
  const renderItem = ({ index, item }: ListRenderItemInfo<string>) => {
    const dynamic = styleFor(item);

    return (
      <View style={styles.lineContainer}>
        {/* Preview de markdown */}
        <Text style={[styles.textBase, dynamic]}>{item || ' '}</Text>

        {/* Input “transparente” sobreposto */}
        <TextInput
          blurOnSubmit={false}
          cursorColor="#111"
          multiline
          onChangeText={(txt) => handleChange(index, txt)}
          onKeyPress={(e) => handleKeyPress(index, e)}
          placeholder={index === 0 ? 'Digite seu markdown…' : undefined}
          placeholderTextColor="#999"
          ref={(ref) => (inputsRef.current[index] = ref)}
          style={[styles.inputOverlay, dynamic]}
          underlineColorAndroid="transparent"
          value={item}
        />
      </View>
    );
  };

  return (
    <FlatList<string>
      data={lines}
      extraData={lines}
      keyboardShouldPersistTaps="always"
      keyExtractor={(_, i) => i.toString()}
      renderItem={renderItem}
    />
  );
}

/** Estilos fixos */
const styles = StyleSheet.create({
  inputOverlay: {
    backgroundColor: 'transparent',
    color: 'transparent',
    left: 0,
    padding: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  lineContainer: {
    position: 'relative',
  },
  textBase: {
    color: '#222',
    padding: 0,
  },
});
