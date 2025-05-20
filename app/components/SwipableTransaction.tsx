import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Transaction } from "../data/sampleData";
import { styles as transactionStyles } from "../styles/transactionStyles";
import { formatCurrency } from "./transactions/transactionHelpers";

interface SwipeableTransactionProps {
  item: Transaction;
  onPress: (transaction: Transaction) => void;
  onIconPress: (transaction: Transaction) => void;
  onDelete: (transactionId: number) => void;
  renderTransactionIcon: (category: string) => React.ReactElement; // Fixed: JSX.Element -> React.ReactElement
}

const SwipeableTransaction: React.FC<SwipeableTransactionProps> = ({
  item,
  onPress,
  onIconPress,
  onDelete,
  renderTransactionIcon
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  // Render delete action when swiped
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    const confirmDelete = () => {
      Alert.alert(
        "Delete Transaction",
        "Are you sure you want to delete this transaction?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => swipeableRef.current?.close()
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              onDelete(item.id);
              swipeableRef.current?.close();
            }
          }
        ]
      );
    };

    return (
      <Animated.View style={[styles.deleteContainer, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        style={transactionStyles.transactionItem}
        onPress={() => onPress(item)}
      >
        <TouchableOpacity 
          style={transactionStyles.transactionIconContainer}
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering parent onPress
            onIconPress(item);
          }}
        >
          {renderTransactionIcon(item.category)}
        </TouchableOpacity>
        
        <View style={transactionStyles.transactionDetails}>
          <Text style={transactionStyles.transactionName}>{item.name}</Text>
          <Text style={transactionStyles.transactionCategory}>{item.category}</Text>
        </View>
        
        <Text style={transactionStyles.transactionAmount}>
          {formatCurrency(item.mount)}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  deleteContainer: {
    width: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    width: 80,
    height: '80%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 4,
  },
});

export default SwipeableTransaction;