import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  title: string;
};

function TitleBar({ title }: Props) {
  const { backgrounds, fonts, gutters, layout } = useTheme();
  return (
    <View
      style={[
        backgrounds.gray100,
        layout.flex_1,
        layout.justifyCenter,
        layout.itemsCenter,
        gutters.gap_16,
        gutters.padding_12,
      ]}
    >
      <Text style={[fonts.defaultFontFamilyBold, fonts.gray800, fonts.size_16]}>
        {title}
      </Text>
    </View>
  );
}

export default TitleBar;
