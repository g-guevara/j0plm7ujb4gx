import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

interface CoolScanButtonProps {
  onPress: () => void;
  disabled: boolean;
  scanning: boolean;
  progress: number;
  imageCount: number;
}

const CoolScanButton: React.FC<CoolScanButtonProps> = ({
  onPress,
  disabled,
  scanning,
  progress,
  imageCount,
}) => {
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(0.3);
  const gradientPosition = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const fakeProgress = useSharedValue(0);
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);

  const progressMessages = [
    "Hang on...",
    "AI identifying transactions...",
    "Making progress...",
    "Processing receipt data...",
    "Almost there...",
    "Extracting amounts...",
    "Analyzing text...",
    "Finalizing results...",
  ];

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${fakeProgress.value}%`,
    };
  });

  useEffect(() => {
    if (scanning && progress > 24) {
      fakeProgress.value = withTiming(progress, {
        duration: 500,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [scanning, progress]);

  useEffect(() => {
    let messageInterval: number | null = null;

    if (scanning) {
      messageInterval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % progressMessages.length);
      }, 2000);
    }

    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [scanning, progressMessages.length]);

  useEffect(() => {
    if (scanning) {
      fakeProgress.value = withTiming(24, {
        duration: 1000,
        easing: Easing.out(Easing.quad),
      });

      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      gradientPosition.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );

      iconRotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      fakeProgress.value = withTiming(0, { duration: 300 });
      glowIntensity.value = withTiming(0.3, { duration: 500 });
      gradientPosition.value = withTiming(0, { duration: 500 });

      iconRotation.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 500 }),
          withTiming(5, { duration: 500 })
        ),
        -1,
        true
      );

      setCurrentMessageIndex(0);
    }
  }, [scanning]);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.96);
      glowIntensity.value = withTiming(0.6, { duration: 200 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1);
      glowIntensity.value = withTiming(scanning ? 0.8 : 0.3, { duration: 300 });
    }
  };

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: glowIntensity.value,
      shadowRadius: interpolate(glowIntensity.value, [0.3, 0.8], [8, 20]),
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${iconRotation.value}deg` }],
    };
  });

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: scanning ? 1 : 0.8,
    };
  });

  const getButtonContent = () => {
    if (scanning) {
      const displayProgress = Math.max(progress, 24);
      return {
        text: progressMessages[currentMessageIndex],
        subText: `${displayProgress}%`,
        icon: "hourglass-outline" as const,
      };
    }
    return {
      text: `Scan ${imageCount} Image${imageCount !== 1 ? "s" : ""}`,
      subText: "",
      icon: "scan-outline" as const,
    };
  };

  const { text, subText, icon } = getButtonContent();

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.95}
      >
        <View style={styles.buttonContent}>
          <Animated.View style={[StyleSheet.absoluteFill, gradientAnimatedStyle]}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
<Defs>
  <LinearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <Stop offset="0%" stopColor="#007aff" />
    <Stop offset="100%" stopColor="#007aff" />
  </LinearGradient>
  <LinearGradient id="scanningOverlay" x1="0%" y1="0%" x2="100%" y2="0%">
    <Stop offset="0%" stopColor="#007aff" />
    <Stop offset="100%" stopColor="#007aff" />
  </LinearGradient>
</Defs>



              <Rect x="0" y="0" width="100%" height="100%" rx="32" fill="url(#mainGradient)" />
              {scanning && (
                <Rect
                  x="0"
                  y="0"
                  width={`${Math.max(progress, 24)}%`}
                  height="100%"
                  rx="32"
                  fill="url(#scanningOverlay)"
                  opacity="0.8"
                />
              )}
            </Svg>
          </Animated.View>

          <View style={styles.contentContainer}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <Ionicons name={icon} size={24} color="white" />
            </Animated.View>
            <View style={styles.textContainer}>
              <Text style={styles.buttonText}>{text}</Text>
              {subText && <Text style={styles.subText}>{subText}</Text>}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 280,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#007aff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    borderWidth: 0,
    borderColor: "transparent",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flex: 1,
    position: "relative",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "System",
  },
  subText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    fontFamily: "System",
  },
});

export default CoolScanButton;
