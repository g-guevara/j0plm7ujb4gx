import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Header / Title
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 95,
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  editCardsButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editCardsButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  // Cards Section
  cardsSection: {
    marginVertical: 10,
  },
  cardsList: {
    paddingHorizontal: 15,
  },
  cardItem: {
    width: 150,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
    padding: 15,
    justifyContent: "space-between",
  },
  cardName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  cardAmount: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  // Transactions List
  transactionsList: {
    paddingBottom: 20,
        backgroundColor: "#FFFFFF", // White background
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF", // White background
  },
  sectionHeaderText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
  },
  dotContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  dotSeparator: {
    color: "#fff",
    fontSize: 6,
    letterSpacing: 1,
    height: 10,
    lineHeight: 10,
  },
  sectionHeaderAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888888",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0A500",
    justifyContent: "center",
    alignItems: "center",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 3,
  },
  transactionCategory: {
    fontSize: 14,
    color: "#888888",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  textInput: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  colorSelectorLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    color: "#333",
  },
  colorSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  saveButton: {
    backgroundColor: "#3498db",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});