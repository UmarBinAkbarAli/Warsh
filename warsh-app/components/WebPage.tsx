import { Children, type ReactNode } from "react";
import {
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { WebLayout } from "../constants/theme";

// The shared web page frame. Every web screen is one of four page types
// (design system › Web layout); widths, gutters and grid columns come from
// the design system's web layout tokens, so a change there moves every page.
// On native, and on web below `WebLayout.bpTablet`, everything here is a no-op.

export type WebShellMode = "phone" | "rail" | "sidebar";
export type WebPageType = "dashboard" | "collection" | "reading" | "focus";

/** Which navigation shell a web window of this width gets. */
export function webShellMode(width: number): WebShellMode {
  if (Platform.OS !== "web" || width < WebLayout.bpTablet) return "phone";
  return width < WebLayout.bpLaptop ? "rail" : "sidebar";
}

/** True when the full sidebar shows and screens use their desktop styling (web, 1024px and up). */
export function isDesktopWeb(width: number): boolean {
  return webShellMode(width) === "sidebar";
}

export function useWebLayout() {
  const { width } = useWindowDimensions();
  const shell = webShellMode(width);
  const isWeb = shell !== "phone";
  const isWide = isWeb && width >= WebLayout.bpWide;
  const gutter = !isWeb
    ? 0
    : isWide
      ? WebLayout.gutterWide
      : shell === "sidebar"
        ? WebLayout.gutterLaptop
        : WebLayout.gutterTablet;
  const gridColumns = !isWeb
    ? 1
    : isWide
      ? WebLayout.gridColsWide
      : shell === "sidebar"
        ? WebLayout.gridColsLaptop
        : WebLayout.gridColsTablet;
  return { width, shell, isWeb, isDesktop: shell === "sidebar", isWide, gutter, gridColumns };
}

/**
 * Container style for a page of the given type: use it as a ScrollView's
 * `contentContainerStyle` (or on the page's root View). Every page starts at
 * the same left edge — sidebar + gutter — and only Focus pages centre.
 * Returns `{}` on native and phone-width web, so mobile layouts are untouched.
 */
export function useWebPageStyle(type: WebPageType): ViewStyle {
  const layout = useWebLayout();
  if (!layout.isWeb) return {};
  const contentMax = type === "reading" || type === "focus" ? WebLayout.readingMax : WebLayout.pageMax;
  return {
    width: "100%",
    maxWidth: contentMax + layout.gutter * 2,
    paddingHorizontal: layout.gutter,
    alignSelf: type === "focus" ? "center" : "flex-start",
  };
}

type WebPageProps = {
  type: WebPageType;
  /** Dashboard only: secondary panel. A side column from `bpWide`, stacked under the main content below it. */
  side?: ReactNode;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** View form of the page frame, for screens whose root is not a ScrollView. */
export function WebPage({ type, side, style, children }: WebPageProps) {
  const layout = useWebLayout();
  const pageStyle = useWebPageStyle(type);

  if (type === "dashboard" && side != null && layout.isWide) {
    return (
      <View style={[pageStyle, styles.row, { gap: layout.gutter }, style]}>
        <View style={styles.main}>{children}</View>
        <View style={{ width: WebLayout.sideColumn }}>{side}</View>
      </View>
    );
  }

  return (
    <View style={[pageStyle, style]}>
      {children}
      {type === "dashboard" && side != null ? <View style={{ marginTop: layout.gutter }}>{side}</View> : null}
    </View>
  );
}

type WebGridProps = {
  /** Columns on native and phone-width web. Default 1. */
  phoneColumns?: number;
  gap?: number;
  children: ReactNode;
};

/** Collection grid: `phoneColumns` on phones, then 2 / 3 / 4 columns at the web breakpoints. */
export function WebGrid({ phoneColumns = 1, gap = WebLayout.gridGap, children }: WebGridProps) {
  const layout = useWebLayout();
  const columns = layout.isWeb ? Math.max(layout.gridColumns, phoneColumns) : phoneColumns;
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));

  return (
    <View style={{ gap }}>
      {rows.map((row, r) => (
        <View key={r} style={[styles.gridRow, { gap }]}>
          {row.map((item, c) => (
            <View key={c} style={styles.cell}>
              {item}
            </View>
          ))}
          {Array.from({ length: columns - row.length }, (_, k) => (
            <View key={`pad-${k}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  main: { flex: 1, minWidth: 0 },
  // Cards in one grid row share its height.
  gridRow: { flexDirection: "row", alignItems: "stretch" },
  cell: { flex: 1, minWidth: 0 },
});
