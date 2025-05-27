import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '160%',
    width: '100%',
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  
  // Header Section
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 95,
    paddingBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  
  // Header Component styles
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  cardIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardName: {
    color: 'white',
    fontWeight: '600',
  },
  
  // Scroll Content
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  
  // Section Styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  
  // API Key Section
  apiKeySection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  apiKeyContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  apiKeyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  apiKeyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  apiKeyInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  apiKeyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  // Image Grid Container - Single card design
  imageGridContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageGridTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  imageCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageGridSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  imageGrid: {
    justifyContent: 'flex-start',
  },
  
  // ADD IMAGE BUTTON - Circular design
  addImageCircle: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  addImageCircleDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  
  // IMAGE GRID ITEM
  imageGridItem: {
    width: 100,
    height: 100,
    margin: 4,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButtonGrid: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  
  // EMPTY STATE for images
  emptyImageState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyImageText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  
  // OLD IMAGE SECTION STYLES (keeping for backward compatibility)
  imageContainer: {
    marginBottom: 16,
  },
  imagePicker: {
    width: "100%",
    height: 180,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePickerText: {
    color: "#6c757d",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
    fontWeight: '500',
  },
  imageCountContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageCountText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3498db",
    marginTop: 10,
  },
  imageTapText: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 5,
  },
  
  // OLD Thumbnails (keeping for backward compatibility)
  thumbnailContainer: {
    marginTop: 16,
  },
  thumbnailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  thumbnailList: {
    paddingVertical: 8,
  },
  imageItemContainer: {
    marginRight: 12,
    position: "relative",
  },
  imageItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e9ecef",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 2,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  addImageText: {
    color: "#3498db",
    marginLeft: 8,
    fontWeight: "600",
  },
  
  // Scan Action Section
  scanActionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanButton: {
    backgroundColor: "#3498db",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonDisabled: {
    backgroundColor: "#95a5a6",
    opacity: 0.7,
  },
  scanButtonIcon: {
    marginRight: 8,
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Progress Section
  progressSection: {
    marginTop: 16,
  },
  progressContainer: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3498db",
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  // Results Section
  resultsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    marginRight: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: '500',
  },
  
  // Transaction Cards
  transactionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  selectedCard: {
    backgroundColor: "#f8f9ff",
    borderColor: "#3498db",
    borderWidth: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  cardNameText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  categoryText: {
    color: "#2e7d32",
    fontWeight: "500",
    fontSize: 12,
  },
  transactionAmount: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e53935",
    marginBottom: 8,
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 8,
  },
  checkboxContainer: {
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  
  // Empty State Section
  emptyStateSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Button Container (legacy support)
  buttonContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  
  // Logs Container (if needed)
  logsContainer: {
    margin: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  logsTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  logsScrollView: {
    height: 200,
    marginTop: 8,
  },
  logLine: {
    color: '#666',
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 2,
  },

  selectedCardName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  
  // Selected Card Section
  selectedCardSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  selectedCardIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
});