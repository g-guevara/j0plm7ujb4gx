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
    withTiming
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
  imageCount
}) => {
  // Animated values - Much simpler and elegant
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(0.3);
  const gradientPosition = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);
  const iconRotation = useSharedValue(0);
  const fakeProgress = useSharedValue(0); // New fake progress
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);

  // Progress messages that change every 2 seconds
  const progressMessages = [
    "Hang on...",
    "AI identifying transactions...",
    "Making progress...", 
    "Processing receipt data...",
    "Almost there...",
    "Extracting amounts...",
    "Analyzing text...",
    "Finalizing results..."
  ];

  // Subtle shimmer animation
  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
      -1,
      false
    );
  }, []);

  // Progress animated style
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${fakeProgress.value}%`,
    };
  });

  // Update progress when real progress changes
  useEffect(() => {
    if (scanning && progress > 24) {
      // Move from fake progress to real progress
      fakeProgress.value = withTiming(progress, { 
        duration: 500, 
        easing: Easing.out(Easing.quad) 
      });
    }
  }, [scanning, progress]);

  // Change message every 2 seconds during scanning
  useEffect(() => {
    let messageInterval: number | null = null;
    
    if (scanning) {
      messageInterval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => 
          (prevIndex + 1) % progressMessages.length
        );
      }, 2000);
    }
    
    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [scanning, progressMessages.length]);

  // Scanning animations - More elegant with fake progress
  useEffect(() => {
    if (scanning) {
      // Start fake progress immediately - always goes to 24%
      fakeProgress.value = withTiming(24, { 
        duration: 1000, 
        easing: Easing.out(Easing.quad) 
      });
      
      // Subtle glow pulse
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      
      // Gradient movement
      gradientPosition.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      
      // Gentle icon rotation
      iconRotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      // Reset to calm state
      fakeProgress.value = withTiming(0, { duration: 300 });
      glowIntensity.value = withTiming(0.3, { duration: 500 });
      gradientPosition.value = withTiming(0, { duration: 500 });
      iconRotation.value = withTiming(0, { duration: 500 });
      setCurrentMessageIndex(0);
    }
  }, [scanning]);

  // Handle press animations
  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  // Main container animated style
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Glow animated style
  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: glowIntensity.value,
      shadowRadius: interpolate(glowIntensity.value, [0.3, 0.8], [8, 20]),
    };
  });

  // Shimmer animated style
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-320, 320]
    );

    return {
      transform: [{ translateX }],
      opacity: disabled ? 0 : 0.4,
    };
  });

  // Icon animated style
  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${iconRotation.value}deg` }],
    };
  });

  // Gradient animated style
  const gradientAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: scanning ? 1 : 0.8,
    };
  });

  // Get button content
  const getButtonContent = () => {
    if (scanning) {
      // Show at least 24% during scanning, then real progress
      const displayProgress = Math.max(progress, 24);
      return {
        text: progressMessages[currentMessageIndex],
        subText: `${displayProgress}%`,
        icon: "hourglass-outline" as const
      };
    }
    
    return {
      text: `Scan ${imageCount} Image${imageCount !== 1 ? 's' : ''}`,
      subText: "",
      icon: "scan-outline" as const
    };
  };

  const { text, subText, icon } = getButtonContent();

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Outer glow */}
      {/* <Animated.View style={[styles.glowContainer, glowAnimatedStyle]} /> */}
      
      {/* Main button */}
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.95}
      >
        <View style={styles.buttonContent}>
          {/* Background gradient */}
          <Animated.View style={[StyleSheet.absoluteFill, gradientAnimatedStyle]}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop 
                    offset="0%" 
                    stopColor={disabled ? "#bdc3c7" : "#4a90e2"} 
                  />
                  <Stop 
                    offset="25%" 
                    stopColor={disabled ? "#95a5a6" : "#3498db"} 
                  />
                  <Stop 
                    offset="75%" 
                    stopColor={disabled ? "#7f8c8d" : "#2980b9"} 
                  />
                  <Stop 
                    offset="100%" 
                    stopColor={disabled ? "#95a5a6" : "#1e6091"} 
                  />
                </LinearGradient>
                
                {/* Scanning overlay gradient */}
                <LinearGradient id="scanningOverlay" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                  <Stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                  <Stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                </LinearGradient>
              </Defs>
              
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="32"
                fill="url(#mainGradient)"
              />
              
              {/* Full button progress overlay */}
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

          {/* Subtle shimmer */}
          <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]}>
            <Svg height="100%" width="100" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <Stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
                  <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100"
                height="100%"
                rx="32"
                fill="url(#shimmerGradient)"
              />
            </Svg>
          </Animated.View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <Ionicons 
                name={icon} 
                size={24} 
                color="white" 
              />
            </Animated.View>
            <View style={styles.textContainer}>
              <Text style={styles.buttonText}>{text}</Text>
              {subText && (
                <Text style={styles.subText}>{subText}</Text>
              )}
            </View>
          </View>

        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: 300,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: 280,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 0, // Explicitly no border
    borderColor: 'transparent', // Explicitly transparent border
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flex: 1,
    position: 'relative',
    borderWidth: 0, // Explicitly no border
    borderColor: 'transparent', // Explicitly transparent border
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default CoolScanButton;