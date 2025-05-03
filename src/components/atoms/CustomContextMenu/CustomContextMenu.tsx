import type { PropsWithChildren, ReactElement } from 'react';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';

import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

import { SelectedItemStateAtom } from '@/state/atoms/temporaryContent';

export type ContextMenuItem = {
  color: string;
  disabled?: boolean;
  icon: ReactElement;
  label: string;
  onPress?: () => void;
};

type CustomContextMenuProps = PropsWithChildren<{
  backgroundColor: string;
  id: string;
  menuItems: ContextMenuItem[];
  menuTitle: string;
  menuTitleBackgroundColor: string;
  onPress: () => void;
}>;

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

function CustomContextMenu({
  backgroundColor,
  children = false,
  id,
  menuItems,
  menuTitle,
  menuTitleBackgroundColor,
  onPress,
}: CustomContextMenuProps) {
  const setSelectedItem = useSetAtom(SelectedItemStateAtom);
  const { colors } = useTheme();

  const [menuVisible, setMenuVisible] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [finalPosition, setFinalPosition] = useState({ x: -9999, y: -9999 });

  const styles = StyleSheet.create({
    menuContainer: {
      backgroundColor,
      borderRadius: 6,
      elevation: 5,
      paddingBottom: 4,
      position: 'absolute',
      shadowColor: 'rgba(0,0,0,0.4)', // iOS
      shadowOffset: { height: 2, width: 2 },
      shadowOpacity: 0.3,
    },
    menuIcon: {
      marginRight: 8,
    },
    menuItem: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    menuItemDisabled: {
      alignItems: 'center',
      filter: 'grayscale(100%)',
      flexDirection: 'row',
      opacity: 0.4,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    menuTitle: {
      backgroundColor: menuTitleBackgroundColor + '80',
      color: colors.gray800,
      fontSize: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
  });

  const handleLongPress = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setTouchPosition({ x: pageX, y: pageY });
    setMenuVisible(true);
    setFinalPosition({ x: -9999, y: -9999 });
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  const handleMenuLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout;
    let px = touchPosition.x;
    let py = touchPosition.y;

    if (px + width > SCREEN_WIDTH) {
      px = SCREEN_WIDTH - width - 5;
    }

    if (py + height > SCREEN_HEIGHT - 65) {
      py = SCREEN_HEIGHT - height - 65;
    }

    if (px < 0) {
      px = 0;
    }
    if (py < 0) {
      py = 0;
    }

    setFinalPosition({ x: px, y: py });
  };

  useEffect(() => {
    if (menuVisible) {
      setSelectedItem(id);
    } else {
      setSelectedItem('');
    }
  }, [id, menuVisible]);

  return (
    <View>
      <Pressable onLongPress={handleLongPress} onPress={onPress}>
        {children}
      </Pressable>
      {menuVisible && (
        <Modal
          animationType="none"
          onRequestClose={handleCloseMenu}
          transparent={true}
          visible={true}
        >
          <Pressable onPress={handleCloseMenu} style={StyleSheet.absoluteFill}>
            <View />
          </Pressable>
          <View
            onLayout={handleMenuLayout}
            style={[
              styles.menuContainer,
              {
                left: finalPosition.x,
                top: finalPosition.y,
              },
            ]}
          >
            <Text style={styles.menuTitle}>{menuTitle}</Text>
            {menuItems.map((item, i) => (
              <Pressable
                disabled={item.disabled}
                key={i}
                onPress={() => {
                  item.onPress?.();
                  handleCloseMenu();
                }}
                style={
                  item.disabled ? styles.menuItemDisabled : styles.menuItem
                }
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={{ color: item.color, fontSize: 16 }}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Modal>
      )}
    </View>
  );
}

export default CustomContextMenu;
