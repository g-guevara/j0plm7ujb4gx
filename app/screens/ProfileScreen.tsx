// app/screens/ProfileScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { cardData, transactionData } from "../data/sampleData";


import { CurrencyModal, ProfileOption } from "../components/ProfileComponents";


import { currencies, getUniqueCategories, handleCategoriesPress, handleExportExcel, handleHelpSupport, handleNotifications, handlePrivacySecurity } from "../utils/ProfileHandlers";

export default function ProfileScreen() {
  const router = useRouter();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [stats, setStats] = useState({
    cards: 0,
    transactions: 0,
    categories: 0
  });

  const categories = getUniqueCategories();
  
  // Update stats when component mounts
  useEffect(() => {
    setStats({
      cards: cardData.length,
      transactions: transactionData.length,
      categories: categories.length
    });
  }, []);

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
          <Text style={styles.headerTitle}></Text>
        </View>
        
        {/* Profile content */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={120} color="#3498db" />
          </View>
          
          <Text style={styles.name}>Settings</Text>
          <Text style={styles.email}></Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.cards}</Text>
              <Text style={styles.statLabel}>Cards</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.transactions}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.categories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>
          
          <View style={styles.profileOptions}>
            {/* Currency Selection Option */}

            
            {/* <ProfileOption 
              icon="cash-outline"
              text="Currency"
              onPress={() => setShowCurrencyModal(true)}
              badge={
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyBadgeText}>{selectedCurrency}</Text>
                </View>
              }
            /> */}
            
            {/* Categories Option */}
            <ProfileOption 
              icon="pricetags-outline"
              text="Categories"
              onPress={() => handleCategoriesPress(router)}
              badge={
                <View style={styles.categoryCircles}>
                  {categories.slice(0, 4).map((category, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.categoryCircle, 
                        { backgroundColor: category.color, marginLeft: index > 0 ? -8 : 0 }
                      ]}
                    />
                  ))}
                  {categories.length > 4 && (
                    <View style={[styles.categoryCircle, styles.moreIndicator]}>
                      <Text style={styles.moreText}>+{categories.length - 4}</Text>
                    </View>
                  )}
                </View>
              }
            />
            
            {/* Export to Excel Option */}
            <ProfileOption 
              icon="download-outline"
              text="Export to Excel"
              onPress={handleExportExcel}
            />
            
            <ProfileOption 
              icon="notifications-outline"
              text="Notifications"
              onPress={handleNotifications}
            />
            
            <ProfileOption 
              icon="shield-checkmark-outline"
              text="Privacy & Security"
              onPress={handlePrivacySecurity}
            />
            
            <ProfileOption 
              icon="help-circle-outline"
              text="Help & Support"
              onPress={handleHelpSupport}
            />
          </View>
        </View>
      </View>
      
      {/* Currency Selection Modal */}
      <CurrencyModal 
        visible={showCurrencyModal}
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        onClose={() => setShowCurrencyModal(false)}
        onSelect={(currency) => {
          setSelectedCurrency(currency);
          setShowCurrencyModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#fff", 
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
  moreIndicator: {
    backgroundColor: "#95a5a6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -8,
  },
  moreText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
});