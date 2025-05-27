// app/screens/ProfileComponents.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Interface for currency
interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Props for ProfileOption component
interface ProfileOptionProps {
  icon: string;
  text: string;
  onPress: () => void;
  badge?: React.ReactNode;
}

// Props for CurrencyModal component
interface CurrencyModalProps {
  visible: boolean;
  currencies: Currency[];
  selectedCurrency: string;
  onClose: () => void;
  onSelect: (currency: string) => void;
}

// ProfileOption Component
export const ProfileOption: React.FC<ProfileOptionProps> = ({
  icon,
  text,
  onPress,
  badge
}) => (
  <TouchableOpacity 
    style={styles.optionItem}
    onPress={onPress}
  >
    <Ionicons name={icon as any} size={24} color="#555" />
    <Text style={styles.optionText}>{text}</Text>
    {badge}
    <Ionicons name="chevron-forward" size={20} color="#999" />
  </TouchableOpacity>
);

// CurrencyModal Component
export const CurrencyModal: React.FC<CurrencyModalProps> = ({
  visible,
  currencies,
  selectedCurrency,
  onClose,
  onSelect
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Currency</Text>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {currencies.map((currency, index) => (
          <TouchableOpacity 
            key={currency.code}
            style={[
              styles.currencyOption,
              selectedCurrency === currency.code && styles.selectedCurrency,
              index !== currencies.length - 1 && styles.currencyBorder
            ]}
            onPress={() => onSelect(currency.code)}
          >
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>{currency.code}</Text>
              <Text style={styles.currencyName}>{currency.name}</Text>
            </View>
            {selectedCurrency === currency.code && (
              <Ionicons name="checkmark-circle" size={24} color="#3498db" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  // ProfileOption Styles
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    color: "#333",
  },
  
  // Currency Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  currencyBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedCurrency: {
    backgroundColor: "#f8f8f8",
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: "bold",
    width: 40,
    textAlign: "center",
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  currencyName: {
    fontSize: 14,
    color: "#666",
  },
});