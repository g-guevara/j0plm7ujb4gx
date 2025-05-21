import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import Svg, {
    Circle,
    Defs,
    FeColorMatrix,
    FeComposite,
    FeGaussianBlur,
    Filter,
    G,
    Path
} from "react-native-svg";

import { styles } from "../../styles/DashboardScreenStyles";

interface DonutChartProps {
  categories: {
    name: string;
    amount: number;
    color: string;
  }[];
}

export const DonutChart: React.FC<DonutChartProps> = ({ categories }) => {
  const size = Dimensions.get("window").width * 0.7;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Pre-defined colors that match the reference image
  const pillColors = [
    "#9c56e8", // Purple
    "#4a9bea", // Blue
    "#f27ab1", // Pink
    "#f8a427", // Orange
    "#4a9bea", // Blue
  ];
  
  // Define pill-shaped segments with their positions - positioned to avoid overlap
  const renderPillSegments = () => {
    const segments: React.ReactNode[] = [];
    
    // Define the glow filter ID for each color
    const glowFilterIds = pillColors.map((color, i) => `glow-${i}`);
    
    // Each segment is defined by starting and ending angle and a length
    // Angles are in degrees, where 0 is at the top and angle increases clockwise
    const segmentDefinitions = [
      { startAngle: -10, length: 60, color: pillColors[0], glowColor: "#9c56e8", glowId: glowFilterIds[0] },  // Purple top-left
      { startAngle: 70, length: 60, color: pillColors[1], glowColor: "#4a9bea", glowId: glowFilterIds[1] },   // Blue top-right
      { startAngle: 150, length: 45, color: pillColors[2], glowColor: "#f27ab1", glowId: glowFilterIds[2] },  // Pink right
      { startAngle: 215, length: 50, color: pillColors[3], glowColor: "#f8a427", glowId: glowFilterIds[3] },  // Orange bottom-right
      { startAngle: 285, length: 60, color: pillColors[1], glowColor: "#4a9bea", glowId: glowFilterIds[4] },  // Blue bottom-left
    ];
    
    // Create the pill segments
    segmentDefinitions.forEach((segment, index) => {
      const startAngleDeg = segment.startAngle;
      const endAngleDeg = startAngleDeg + segment.length;
      
      // Convert to radians
      const startAngle = (startAngleDeg * Math.PI) / 180;
      const endAngle = (endAngleDeg * Math.PI) / 180;
      
      segments.push(
        <Path
          key={`segment-${index}`}
          d={`
            M ${center + radius * Math.cos(startAngle)} ${center + radius * Math.sin(startAngle)}
            A ${radius} ${radius} 0 0 1 ${center + radius * Math.cos(endAngle)} ${center + radius * Math.sin(endAngle)}
          `}
          stroke={segment.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          filter={`url(#${segment.glowId})`}
        />
      );
    });
    
    return segments;
  };

  // For the demo, we'll use hardcoded values to match exactly the reference image
  // In a real implementation, you would use the first category from props
  const mainCategory = categories.length > 0 ? categories[0] : null;

  return (
    <View style={styles.donutChartContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Define glow filters for each color */}
        <Defs>
          {/* Purple glow filter */}
          <Filter id="glow-0" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="3" result="blur" />
            <FeColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.612 0 0 0 0 0.337 0 0 0 0 0.91 0 0 0 1 0"
              result="glow"
            />
            <FeComposite in="SourceGraphic" in2="glow" operator="over" />
          </Filter>
          
          {/* Blue glow filter */}
          <Filter id="glow-1" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="3" result="blur" />
            <FeColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.29 0 0 0 0 0.608 0 0 0 0 0.918 0 0 0 1 0"
              result="glow"
            />
            <FeComposite in="SourceGraphic" in2="glow" operator="over" />
          </Filter>
          
          {/* Pink glow filter */}
          <Filter id="glow-2" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="3" result="blur" />
            <FeColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.949 0 0 0 0 0.478 0 0 0 0 0.694 0 0 0 1 0"
              result="glow"
            />
            <FeComposite in="SourceGraphic" in2="glow" operator="over" />
          </Filter>
          
          {/* Orange glow filter */}
          <Filter id="glow-3" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="4" result="blur" />
            <FeColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.973 0 0 0 0 0.643 0 0 0 0 0.153 0 0 0 1 0"
              result="glow"
            />
            <FeComposite in="SourceGraphic" in2="glow" operator="over" />
          </Filter>
          
          {/* Blue glow filter (bottom) */}
          <Filter id="glow-4" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="3" result="blur" />
            <FeColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.29 0 0 0 0 0.608 0 0 0 0 0.918 0 0 0 1 0"
              result="glow"
            />
            <FeComposite in="SourceGraphic" in2="glow" operator="over" />
          </Filter>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#f2f2f2"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Render all pill segments */}
        <G>
          {renderPillSegments()}
        </G>
      </Svg>
      
      {/* Center content */}
      <View style={styles.donutChartCenter}>
        <View style={[styles.categoryIcon, { backgroundColor: "#f8a427" }]}>
          <Ionicons 
            name="home-outline"
            size={22} 
            color="white" 
          />
        </View>
        <Text style={styles.donutChartAmount}>
          US$1.700
        </Text>
        <Text style={styles.donutChartLabel}>
          RENT
        </Text>
      </View>
    </View>
  );
};

export default DonutChart;