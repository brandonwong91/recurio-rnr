import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { Image } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/lib/constants';

const icon = require('../assets/images/icon.png');

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  const opacity = useSharedValue(1);
  const { isDarkColorScheme } = useColorScheme();

  useEffect(() => {
    const fadeOut = () => {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onAnimationComplete)();
      });
    };

    const timer = setTimeout(fadeOut, 1000); // Show for 1 second, then fade out

    return () => clearTimeout(timer);
  }, [onAnimationComplete, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const backgroundColor = isDarkColorScheme ? NAV_THEME.dark.background : NAV_THEME.light.background;

  return (
    <Animated.View style={[styles.container, { backgroundColor }, animatedStyle]}>
      <Image
        source={icon}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  image: {
    width: 100,
    height: 100,
  },
});
