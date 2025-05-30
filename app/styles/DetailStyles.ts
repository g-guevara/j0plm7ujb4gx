import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "600",
  },
  amountCard: {
    backgroundColor: "#3498db",
    padding: 24,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
  },
  cardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
  },
  cardBadgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  inputField: {
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 180,
    backgroundColor: "#fff",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
  categoryBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 14,
  },
  // New styles for category selector
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingRight: 8,
    backgroundColor: "#fff",
  },
  cardChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  cardChipText: {
    fontWeight: "600",
    fontSize: 14,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  similarCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  similarName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  similarDate: {
    fontSize: 14,
    color: "#888",
  },
  similarCardText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  similarAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2ecc71",
  },
  errorText: {
    fontSize: 18,
    color: "#C62828",
    textAlign: "center",
    marginTop: 40,
  },
  // Card Picker Modal styles
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
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  cardsList: {
    paddingVertical: 8,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCardItem: {
    borderWidth: 2,
    borderColor: "white",
  },
  cardItemName: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  selectedCardCheck: {
    backgroundColor: "transparent",
  },
  closeButton: {
    backgroundColor: "#95a5a6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});