import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
}

export function Avatar({ uri, name, size = 56 }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitial = (fullName: string): string => {
    const trimmed = fullName.trim();
    return trimmed.charAt(0).toUpperCase();
  };

  const getBackgroundColor = (name: string): string => {
    // Generate a consistent color based on the name
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (!uri || imageError) {
    return (
      <View
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getBackgroundColor(name),
          },
        ]}>
        <Text
          style={[
            styles.initial,
            {
              fontSize: size * 0.4,
              lineHeight: size * 0.4,
            },
          ]}>
          {getInitial(name)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      onError={() => setImageError(true)}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#f0f0f0',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
