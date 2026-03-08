import { StyleSheet } from "react-native";

export const appStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fb"
  },
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827"
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 8
  },
  endpoint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12
  },
  listContent: {
    paddingBottom: 24
  },
  emptyListContent: {
    flexGrow: 1
  },
  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  infoText: {
    marginTop: 12,
    textAlign: "center",
    color: "#4b5563",
    fontSize: 15
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#b91c1c",
    marginBottom: 8
  },
  errorText: {
    textAlign: "center",
    color: "#7f1d1d",
    fontSize: 15
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151"
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardMeta: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
    marginRight: 10
  },
  favoriteBadge: {
    fontSize: 18,
    color: "#9a3412",
    fontWeight: "700"
  },
  detailsWrapper: {
    flex: 1,
    paddingTop: 16
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827"
  },
  detailsScroll: {
    flex: 1
  },
  detailsScreen: {
    paddingBottom: 24
  },
  detailsTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  detailsMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16
  },
  favoriteButton: {
    alignSelf: "flex-start",
    backgroundColor: "#fff7ed",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
    marginBottom: 16
  },
  favoriteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9a3412"
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  detailsText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 12
  },
  blockHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12
  },
  formulaBlock: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  formulaLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6
  },
  formulaText: {
    fontSize: 16,
    color: "#111827"
  },
  listBlock: {
    marginBottom: 12
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 6
  },
  settingsScreen: {
    paddingTop: 16,
    paddingBottom: 24
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16
  },
  settingsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12
  },
  settingsLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6
  },
  settingsValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600"
  },
  reloadButton: {
    marginTop: 8,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center"
  },
  reloadButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700"
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    gap: 8
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center"
  },
  tabButtonActive: {
    backgroundColor: "#111827"
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563"
  },
  tabButtonTextActive: {
    color: "#ffffff"
  }
});