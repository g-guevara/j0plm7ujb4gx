import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

interface ExpenseHistoryChartProps {
  data: number[];
  budget?: number;
  title?: string;
  amount?: number;
}

export const ExpenseHistoryChart: React.FC<ExpenseHistoryChartProps> = ({ 
  data, 
  budget, 
  title = "SPENT THIS MONTH",
  amount = 4466
}) => {
  const width = Dimensions.get('window').width - 32; // Full width minus padding
  const height = 180;
  const paddingTop = 30;
  const paddingBottom = 40;
  const paddingLeft = 20;
  const paddingRight = 40; // Increased padding on the right
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Calculate max value for scaling
  const maxValue = Math.max(...data, budget || 0) * 1.1; // 10% headroom
  
  // Generate chart points
  const points = data.map((value, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
    return { x, y };
  });
  
  // Generate path for the line
  const linePath = points.map((point, i) => 
    i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
  ).join(' ');
  
  // Generate area below the line for gradient fill
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Days of the month for x-axis
  const daysToShow = [1, 6, 11, 16, 21, 26, 31];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>US${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
      
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#9C56E8" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#9C56E8" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        
        {/* Area fill with gradient */}
        <Path
          d={areaPath}
          fill="url(#areaGradient)"
        />
        
        {/* Main line */}
        <Path
          d={linePath}
          stroke="#9C56E8"
          strokeWidth={3}
          fill="none"
        />
        
        {/* Last point with dot */}
        <Circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={6}
          fill="#9C56E8"
          stroke="white"
          strokeWidth={2}
        />
        
        {/* X-axis labels (days) */}
        {daysToShow.map((day, index) => {
          const x = paddingLeft + (chartWidth / (daysToShow.length - 1)) * index;
          return (
            <SvgText
              key={day}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fontSize={12}
              fill="#999999"
            >
              {day}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
  },
});

export default ExpenseHistoryChart;