import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const buttonStyle = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    variant === 'secondary' && styles.secondaryText,
    variant === 'danger' && styles.dangerText,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Animated.View style={[buttonStyle, animatedStyle]}>
        {loading ? (
          <ActivityIndicator color={variant === 'secondary' ? '#007AFF' : '#fff'} />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

import Animated from 'react-native-reanimated';

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#fff',
  },
});
