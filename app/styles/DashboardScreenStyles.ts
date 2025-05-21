import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    width: '100%',
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 95,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  profileIcon: {
    padding: 8,
  },
  // Segmented Control
  segmentedControlContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888888",
  },
  segmentTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  // Filter and Period Navigation
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  filterDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  periodNavigation: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodText: {
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 16,
  },
  // Donut Chart Container Styles
  donutChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  donutChartCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  donutChartAmount: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
    color: "#222222",
  },
  donutChartLabel: {
    fontSize: 14,
    color: "#888888",
    marginTop: 2,
    fontWeight: "500",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8a427",
    justifyContent: "center",
    alignItems: "center",
  },
  // Categories Tabs
  categoriesTabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    backgroundColor: "#FFFFFF",
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#888888",
  },
  categoryTabActive: {
    color: "#000000",
  },
  // Categories List
  categoriesList: {
    marginTop: 8,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f39c12",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default styles;