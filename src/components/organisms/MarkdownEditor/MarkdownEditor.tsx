import type {
  ListRenderItemInfo,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  TextStyle,
} from 'react-native';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

/* ------------------------------------------------------------------ */
/*  MARKDOWN → ESTILO DE LINHA                                         */
/* ------------------------------------------------------------------ */
const BASE = 16;
const LH = BASE * 1.25;

interface HWKeyPressEvent extends TextInputKeyPressEventData {
  /** keyCode vem do Android quando há teclado físico */
  keyCode?: number;
}

function styleFor(line: string): TextStyle {
  if (line.startsWith('### ')) {
    return {
      fontSize: BASE * 1.25,
      fontWeight: '700',
      includeFontPadding: false,
      lineHeight: BASE * 1.5,
      paddingTop: 2,
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

/* ------------------------------------------------------------------ */
/*  PARSE INLINE (bold / italic / bold+italic)                         */
/* ------------------------------------------------------------------ */
type Segment = {
  bold?: boolean;
  italic?: boolean;
  marker?: boolean;
  txt: string;
};

function parseInline(txt: string): Segment[] {
  const segs: Segment[] = [];
  let rest = txt;
  const rx = /(\*\*\*|___|\*\*|__|\*|_)/; // próximos marcadores
  while (rest.length) {
    const m = rest.match(rx);
    if (!m) {
      // não há marcador → fim
      segs.push({ txt: rest });
      break;
    }
    const [mark] = m;
    const start = m.index ?? 0;
    if (start) {
      segs.push({ txt: rest.slice(0, start) });
    } // texto antes do marcador

    /* — marcador de abertura visível — */
    segs.push({ marker: true, txt: mark });

    rest = rest.slice(start + mark.length); // pula abertura
    const end = rest.indexOf(mark);
    if (end === -1) {
      // sem fechamento
      segs.push({ txt: rest }); // trata tudo como texto
      break;
    }

    const content = rest.slice(0, end);
    rest = rest.slice(end + mark.length); // pula fechamento

    /* — conteúdo estilizado — */
    const bold = mark.length >= 2;
    const italic = mark.length === 1 || mark.length === 3;
    segs.push({ bold, italic, txt: content });

    /* — marcador de fechamento visível — */
    segs.push({ marker: true, txt: mark });
  }
  return segs;
}

function renderInline(txt: string): React.ReactNode {
  return parseInline(txt).map((s, i) => (
    <Text
      key={i}
      style={{
        color: s.marker ? '#888' : undefined, // marcação em cinza
        fontStyle: s.italic ? 'italic' : undefined,
        fontWeight: s.bold ? '700' : undefined,
      }}
    >
      {s.txt || ' '}
    </Text>
  ));
}

/* ------------------------------------------------------------------ */
/*  COMPONENTE                                                         */
/* ------------------------------------------------------------------ */
export default function MarkdownEditor({ initialValue = '' }) {
  /* ---------- controles de “modo” -------------------------------- */
  const [isTypewriter, setIsTypewriter] = useState(true); // liga / desliga
  const [centerOffset, setCenterOffset] = useState(0); // px acima(+)/abaixo(-)

  /* ---------- viewport ------------------------------------------- */
  const { height: winH } = useWindowDimensions();
  const HALF = winH / 2;

  /* ---------- markdown lines ------------------------------------- */
  const [lines, setLines] = useState(
    initialValue.length ? initialValue.split(/\n/) : [''],
  );

  /* ---------- refs ------------------------------------------------ */
  const listRef = useRef<FlatList<string>>(null);
  const inputsRef = useRef<Record<number, null | TextInput>>({});
  const selStart = useRef<Record<number, number>>({});
  const heightsRef = useRef<number[]>(lines.map(() => LH));
  const caret = useRef(0); // linha focada

  /* ---------- helpers -------------------------------------------- */
  const offsetBefore = useCallback(
    (i: number) => heightsRef.current.slice(0, i).reduce((a, b) => a + b, 0),
    [],
  );

  const scrollToCenter = useCallback(
    (i: number) => {
      if (!isTypewriter) {
        return;
      } // modo off
      const hLine = heightsRef.current[i] ?? LH;
      const offset =
        winH + // header vazio 1× viewport
        offsetBefore(i) +
        hLine / 2 -
        HALF +
        centerOffset;
      listRef.current?.scrollToOffset({ animated: false, offset });
    },
    [isTypewriter, winH, HALF, centerOffset, offsetBefore],
  );

  const setHeight = useCallback(
    (i: number, h: number) => {
      if (heightsRef.current[i] === h) {
        return;
      }
      heightsRef.current[i] = h;
      if (i === caret.current) {
        requestAnimationFrame(() => scrollToCenter(i));
      }
    },
    [scrollToCenter],
  );

  /* ---------- edição --------------------------------------------- */
  const insertBelow = useCallback((i: number, first = '', rest = '') => {
    setLines((p) => {
      const n = [...p];
      n[i] = first;
      n.splice(i + 1, 0, rest);
      return n;
    });
    heightsRef.current.splice(i + 1, 0, LH);
    setTimeout(() => inputsRef.current[i + 1]?.focus(), 0);
  }, []);

  const mergeUp = useCallback((i: number) => {
    if (i === 0) {
      return;
    }
    setLines((p) => {
      const n = [...p];
      n[i - 1] += n[i];
      n.splice(i, 1);
      return n;
    });
    heightsRef.current[i - 1] += heightsRef.current[i];
    heightsRef.current.splice(i, 1);
    setTimeout(() => inputsRef.current[i - 1]?.focus(), 0);
  }, []);

  const handleChange = useCallback(
    (i: number, txt: string) => {
      /* 1. Quebra de linha (Enter) -------------------------------- */
      if (txt.includes('\n')) {
        const [before, ...after] = txt.split(/\n/);
        insertBelow(i, before, after.join('\n'));
        return;
      }

      /* 2. Conteúdo mudou na mesma linha --------------------------- */
      setLines((prev) => {
        /* -- detecta Backspace físico – linha já estava vazia e continua vazia */
        if (prev[i] === '' && txt === '') {
          mergeUp(i); // faz “voltar” de linha mesmo sem onKeyPress
          return prev; // mergeUp atualiza o estado internamente
        }

        /* atualização normal do texto na linha */
        const next = [...prev];
        next[i] = txt;
        return next;
      });
    },
    [insertBelow, mergeUp],
  );

  const BACKSPACE_CODES = new Set([
    /* Android (hard-kbd) */ 67 /* KEYCODE_DEL            */,
    /* AOSP / alguns mapeamentos ISO */ 112 /* KEYCODE_FORWARD_DEL? */,
    /* iOS hard-kbd */ 8 /* ASCII Backspace        */,
    /* Samsung Dex / LG */ 115 /* KEYCODE_MEDIA_REWIND   */,
  ]);

  const BACKSPACE_KEYS = new Set(['Backspace', 'Del', 'Delete']);

  const handleKey = useCallback(
    (i: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const native = e.nativeEvent as HWKeyPressEvent;

      const isBs =
        BACKSPACE_KEYS.has(native.key) ||
        BACKSPACE_CODES.has(native.keyCode ?? -1);

      if (!isBs) return;

      const col0 = (selStart.current[i] ?? 0) === 0;
      const isEmpty = lines[i] === '';

      if (isEmpty || col0) {
        mergeUp(i);
      }
    },
    [lines, mergeUp],
  );

  /* ---------- centralizar 1.ª vez -------------------------------- */
  useEffect(() => {
    requestAnimationFrame(() => scrollToCenter(0));
  }, [scrollToCenter]);

  /* ---------- renderItem ----------------------------------------- */
  const renderItem = ({ index, item }: ListRenderItemInfo<string>) => {
    const dyn = styleFor(item);
    return (
      <View
        onLayout={(e) => setHeight(index, e.nativeEvent.layout.height)}
        style={styles.lineContainer}
      >
        <Text style={[styles.textBase, dyn]}>{renderInline(item)}</Text>

        <TextInput
          cursorColor="#111"
          multiline
          onChangeText={(txt) => handleChange(index, txt)}
          onContentSizeChange={(e) =>
            setHeight(index, e.nativeEvent.contentSize.height)
          }
          onFocus={() => {
            caret.current = index;
            scrollToCenter(index);
          }}
          onKeyPress={(e) => handleKey(index, e)}
          onSelectionChange={(e) => {
            /* Watch column to detect caret at the beginning                     */
            selStart.current[index] = e.nativeEvent.selection.start;
            caret.current = index;
            scrollToCenter(index);
          }}
          placeholder={index === 0 ? 'Digite seu markdown…' : undefined}
          placeholderTextColor="#999"
          ref={(r) => (inputsRef.current[index] = r)}
          style={[styles.inputOverlay, dyn]}
          submitBehavior="newline"
          underlineColorAndroid="transparent"
          value={item}
        />
      </View>
    );
  };

  /* ---------- render --------------------------------------------- */
  const blank = { height: isTypewriter ? winH : 0 };

  return (
    <>
      {/* Exemplo rápido de UI de controle – remova/integre como quiser */}
      {/* <Switch value={isTypewriter} onValueChange={setIsTypewriter} /> */}
      {/* <Slider value={centerOffset} onValueChange={setCenterOffset} /> */}

      <FlatList
        data={lines}
        extraData={lines}
        initialNumToRender={20}
        keyboardShouldPersistTaps="always"
        keyExtractor={(_, i) => i.toString()}
        ListFooterComponent={<View style={blank} />}
        ListHeaderComponent={<View style={blank} />} /* calços 1× viewport */
        ref={listRef}
        renderItem={renderItem}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false} /* ← sem scrollbar */
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  STYLES                                                             */
/* ------------------------------------------------------------------ */
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
  lineContainer: { position: 'relative' },
  textBase: { color: '#222', padding: 0 },
});
