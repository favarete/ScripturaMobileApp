import type { ListRenderItemInfo, NativeSyntheticEvent, TextInputKeyPressEventData, TextStyle } from 'react-native';



import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';



import { useTheme } from '@/theme';



import { TypewriterModeStateAtom } from '@/state/atoms/persistentContent';





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

type MarkdownTypewriterEditorProps = {
  initialValue?: string;
};
export default function MarkdownTypewriterEditor({
  initialValue = '',
}: MarkdownTypewriterEditorProps) {
  const { colors } = useTheme();

  const typewriterMode = useAtomValue(TypewriterModeStateAtom);
  const { height, width } = useWindowDimensions();

  const [isTypewriter] = useState(true);
  const [isLandscape, setIsLandscape] = useState(width > height); // px above(+)/below(-)
  const [centerOffset] = useState(typewriterMode ? 60 : 180); // px above(+)/below(-)

  const [, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    // Limpeza
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (width > height !== isLandscape) {
      setIsLandscape(!isLandscape);
    }
  }, [height, width]);

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
  const enterHeld = useRef(false);

  const focusLineEnd = (idx: number) => {
    const inp = inputsRef.current[idx];
    if (!inp) {return;}
    const len = (lines[idx] ?? '').length;
    inp.setNativeProps({ selection: { end: len, start: len } });
  };


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
    if (i === 0) {return;}

    setLines(prev => {
      const n = [...prev];
      n[i - 1] += n[i];
      n.splice(i, 1);
      return n;
    });

    heightsRef.current[i - 1] += heightsRef.current[i];
    heightsRef.current.splice(i, 1);

    /* foca a linha de cima e posiciona cursor no final */
    setTimeout(() => {
      focusLineEnd(i - 1);
      inputsRef.current[i - 1]?.focus();
    }, 0);
  }, []);


  const handleChange = useCallback(
    (i: number, txt: string) => {
      /* 1. Quebra de linha (Enter) -------------------------------- */
      if (txt.includes('\n')) {
        /* já tratamos Enter em handleKey; aqui só removemos o \n */
        txt = txt.replaceAll('\n', '');
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

      /* ---------------- ENTER ---------------- */
      const isEnter =
        native.key === 'Enter' ||
        native.key === '\n'   ||
        native.keyCode === 13 ||
        native.keyCode === 66;

      if (isEnter) {
        if (!enterHeld.current) {
          /* insere UMA quebra manualmente,
             removendo o \n que o SO botou na string */
          setLines(prev => {
            const n = [...prev];
            n[i] = n[i].replaceAll('\n', '');      // limpa \n gerado
            n.splice(i + 1, 0, '');              // nova linha vazia
            return n;
          });
          heightsRef.current.splice(i + 1, 0, LH);
          requestAnimationFrame(() => {
            inputsRef.current[i + 1]?.focus();
          });
        }
        enterHeld.current = true;
        return;
      } else {
        enterHeld.current = false;               // tecla diferente solta Enter
      }

      /* ---------------- BACKSPACE ------------ */
      const isBs =
        BACKSPACE_KEYS.has(native.key) ||
        BACKSPACE_CODES.has(native.keyCode ?? -1);

      if (!isBs) {return;}

      const col0   = (selStart.current[i] ?? 0) === 0;
      const empty  = lines[i] === '';

      if (empty || col0) {
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
          autoFocus={true}
          cursorColor={colors.purple500}
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
          showSoftInputOnFocus={!typewriterMode}
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
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* Gradiente superior: cor → transparente */}
        <LinearGradient
          colors={['white', 'transparent']}
          style={{
            height: HALF / 1.5 + centerOffset, // até a linha do caret
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />

        {/* Gradiente inferior: transparente → cor */}
        <LinearGradient
          colors={['transparent', 'white']}
          style={{
            bottom: 0,
            height: HALF * 1.5 - centerOffset, // idem, parte de baixo
            left: 0,
            position: 'absolute',
            right: 0,
          }}
        />
      </View>
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
