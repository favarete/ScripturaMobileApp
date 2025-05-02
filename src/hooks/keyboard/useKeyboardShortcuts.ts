import { useEffect, useRef } from 'react';
import KeyEvent from 'react-native-keyevent';

export interface ShortcutConfig {
  ctrlTimeout?: number;
  letters?: Record<string, () => void>;
  onSequence?: (sequence: string) => void;
  sequences?: Record<string, () => void>;
}

const getDigit = (keyCode: number): null | string => {
  if (keyCode >= 7 && keyCode <= 16) {
    return (keyCode - 7).toString();
  }
  return null;
};

const getLetter = (keyCode: number): null | string => {
  const codeToLetter = {
    29: 'A',
    30: 'B',
    31: 'C',
    32: 'D',
    33: 'E',
    34: 'F',
    35: 'G',
    36: 'H',
    37: 'I',
    38: 'J',
    39: 'K',
    40: 'L',
    41: 'M',
    42: 'N',
    43: 'O',
    44: 'P',
    45: 'Q',
    46: 'R',
    47: 'S',
    48: 'T',
    49: 'U',
    50: 'V',
    51: 'W',
    52: 'X',
    53: 'Y',
    54: 'Z',
  };
  return codeToLetter[keyCode as keyof typeof codeToLetter] || null;
};

export default function useKeyboardShortcuts({
  ctrlTimeout = 200,
  letters = {},
  onSequence,
  sequences = {},
}: ShortcutConfig) {
  const buffer = useRef<string[]>([]);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const ctrlPressed = useRef(false);

  const CTRL_LEFT = 113;
  const CTRL_RIGHT = 114;

  useEffect(() => {
    const onKeyDown = ({ keyCode }: { keyCode: number }) => {
      if (keyCode === CTRL_LEFT || keyCode === CTRL_RIGHT) {
        ctrlPressed.current = true;
        return;
      }
      if (!ctrlPressed.current) {
        return;
      }

      const digit = getDigit(keyCode);
      if (digit) {
        buffer.current.push(digit);
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }

        timeoutId.current = setTimeout(() => {
          const seq = buffer.current.join('');
          buffer.current = [];

          // (1) Se existir no mapa sequences → chama!
          if (sequences[seq]) {
            sequences[seq]();
          }
          // (2) Se não, mas há onSequence → devolve à tela
          else if (onSequence) {
            onSequence(seq);
          }
        }, ctrlTimeout);
        return;
      }

      const letter = getLetter(keyCode);
      if (letter && letters[letter]) {
        letters[letter]();
      }
    };

    const onKeyUp = ({ keyCode }: { keyCode: number }) => {
      if (keyCode === CTRL_LEFT || keyCode === CTRL_RIGHT) {
        ctrlPressed.current = false;
      }
    };

    KeyEvent.onKeyDownListener(onKeyDown);
    KeyEvent.onKeyUpListener(onKeyUp);

    return () => {
      KeyEvent.removeKeyDownListener();
      KeyEvent.removeKeyUpListener();
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [letters, sequences, onSequence, ctrlTimeout]);
}
