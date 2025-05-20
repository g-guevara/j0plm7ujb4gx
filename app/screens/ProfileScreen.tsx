// app/screens/ProfileScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  
  // List of available currencies
  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "CLP", name: "Chilean Peso", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" }
  ];
  
  // List of app categories
  const categories = [
    { name: "Groceries", icon: "cart-outline", color: "#2ecc71" },
    { name: "Rent", icon: "home-outline", color: "#f39c12" },
    { name: "Bills", icon: "receipt-outline", color: "#e74c3c" },
    { name: "Transportation", icon: "car-outline", color: "#3498db" }
  ];
  
  // Function to handle Excel export (non-functional)
  const handleExportExcel = () => {
    Alert.alert(
      "Export to Excel",
      "This feature is coming soon. Would you like to be notified when it's available?",
      [
        { text: "No" },
        { text: "Yes", onPress: () => Alert.alert("Thank you!", "We'll notify you when this feature is available.") }
      ]
    );
  };
  
  // Modal for currency selection
  const CurrencyModal = () => (
    <Modal
      visible={showCurrencyModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCurrencyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity 
              onPress={() => setShowCurrencyModal(false)}
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
              onPress={() => {
                setSelectedCurrency(currency.code);
                setShowCurrencyModal(false);
              }}
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

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={require('../../assets/images/dashboard-bg.png')}
        style={styles.background}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        
        {/* Profile content */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={120} color="#3498db" />
          </View>
          
          <Text style={styles.name}>User Profile</Text>
          <Text style={styles.email}>user@example.com</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>10</Text>
              <Text style={styles.statLabel}>Cards</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>145</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>
          
          <View style={styles.profileOptions}>
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="settings-outline" size={24} color="#555" />
              <Text style={styles.optionText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            {/* NEW: Currency Selection Option */}
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => setShowCurrencyModal(true)}
            >
              <Ionicons name="cash-outline" size={24} color="#555" />
              <Text style={styles.optionText}>Currency</Text>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>{selectedCurrency}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            {/* NEW: Categories Option */}
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="pricetags-outline" size={24} color="#555" />
              <Text style={styles.optionText}>Categories</Text>
              <View style={styles.categoryCircles}>
                {categories.map((category, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.categoryCircle, 
                      { backgroundColor: category.color, marginLeft: index > 0 ? -8 : 0 }
                    ]}
                  />
                ))}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            {/* NEW: Export to Excel Option */}
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleExportExcel}
            >
              <Ionicons name="download-outline" size={24} color="#555" />
              <Text style={styles.optionText}>Export to Excel</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="notifications-outline" size={24} color="#555" />
              <Text style={styles.optionText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#555" />
              <Text style={styles.optionText}>Privacy & Security</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="help-circle-outline" size={24} color="#555" />
              <Text style={styles.optionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Currency Selection Modal */}
      <CurrencyModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    width: '100%',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 65,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3498db",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  profileOptions: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
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
  logoutButton: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logoutText: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "600",
  },
  // NEW: Currency Badge Styles
  currencyBadge: {
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  currencyBadgeText: {
    color: "#3498db",
    fontWeight: "600",
    fontSize: 14,
  },
  // NEW: Category Circles Styles
  categoryCircles: {
    flexDirection: "row",
    marginRight: 8,
  },
  categoryCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "white",
  },
  // NEW: Currency Modal Styles
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