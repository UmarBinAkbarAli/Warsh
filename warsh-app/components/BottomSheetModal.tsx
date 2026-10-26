import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  Easing,
  FlatList,
  type FlatListProps,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { WarshAlpha } from "../constants/theme";

const ENTER_MS = 300;
const EXIT_MS = 220;
const FADE_IN_MS = 220;
const FADE_OUT_MS = 200;
/** Drag distance, or flick speed, past which a release closes the sheet. */
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.9;
const MIN_FLICK_DISTANCE = 30;

type SheetScroll = { current: number };
const SheetScrollContext = createContext<SheetScroll | null>(null);

/**
 * Spread onto a ScrollView / FlatList inside a BottomSheetModal so a downward
 * drag scrolls the list first and only pulls the sheet down once the list is
 * back at its top, like every native sheet.
 */
export function useSheetScrollProps() {
  const offset = useContext(SheetScrollContext);
  return useMemo(
    () => ({
      scrollEventThrottle: 16,
      onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (offset) offset.current = event.nativeEvent.contentOffset.y;
      },
    }),
    [offset],
  );
}

/** ScrollView that lets the enclosing BottomSheetModal know when it is scrolled. */
export function SheetScrollView(props: ScrollViewProps) {
  const sheet = useSheetScrollProps();
  return (
    <ScrollView
      {...props}
      scrollEventThrottle={sheet.scrollEventThrottle}
      onScroll={(event) => {
        sheet.onScroll(event);
        props.onScroll?.(event);
      }}
    />
  );
}

/** FlatList that lets the enclosing BottomSheetModal know when it is scrolled. */
export function SheetFlatList<T>(props: FlatListProps<T>) {
  const sheet = useSheetScrollProps();
  return (
    <FlatList
      {...props}
      scrollEventThrottle={sheet.scrollEventThrottle}
      onScroll={(event) => {
        sheet.onScroll(event);
        props.onScroll?.(event);
      }}
    />
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Card styling: background, radius, padding. The component adds no chrome of its own. */
  sheetStyle?: StyleProp<ViewStyle>;
  scrimStyle?: StyleProp<ViewStyle>;
  /** Turn off tap-outside and drag-down closing (the Android back button still calls onClose). */
  dismissible?: boolean;
  /**
   * A Modal is its own Android window, so the app's root SafeAreaProvider can
   * report a zero bottom inset inside it. Set this to give the sheet its own
   * provider, so descendants read the real inset.
   */
  ownSafeArea?: boolean;
  closeLabel?: string;
  children: ReactNode;
};

/**
 * Shared bottom sheet. The dimmed backdrop fades in and out in place; only the
 * card slides up from the bottom. Tapping the backdrop or dragging the card
 * down closes it, and the card tracks the finger while it is dragged.
 */
export function BottomSheetModal({
  visible,
  onClose,
  sheetStyle,
  scrimStyle,
  dismissible = true,
  ownSafeArea = false,
  closeLabel,
  children,
}: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(0);
  const scrollOffset = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dismissibleRef = useRef(dismissible);
  dismissibleRef.current = dismissible;

  useEffect(() => {
    if (visible) {
      scrollOffset.current = 0;
      translateY.setValue(sheetHeight.current > 0 ? sheetHeight.current : screenHeight);
      fade.setValue(0);
      setMounted(true);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: FADE_IN_MS, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(translateY, { toValue: 0, duration: ENTER_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start();
      return;
    }
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: FADE_OUT_MS, easing: Easing.in(Easing.quad), useNativeDriver: false }),
      Animated.timing(translateY, {
        toValue: sheetHeight.current > 0 ? sheetHeight.current : screenHeight,
        duration: EXIT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, fade, translateY, screenHeight]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // RN's Modal wraps its content in a view that claims every touch at
        // the start, and a responder above the sheet is never asked about
        // moves, so the sheet has to claim the touch itself on touch-down
        // (a button under the finger still wins and keeps its tap).
        onStartShouldSetPanResponder: () => dismissibleRef.current,
        // A drag that starts on a button is taken over once it is clearly a
        // vertical downward pull while any list inside is at its top.
        onMoveShouldSetPanResponderCapture: (_, g) =>
          dismissibleRef.current &&
          scrollOffset.current <= 0 &&
          g.dy > 6 &&
          Math.abs(g.dy) > Math.abs(g.dx) * 1.5,
        onPanResponderMove: (_, g) => {
          translateY.setValue(Math.max(0, g.dy));
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > DISMISS_DISTANCE || (g.dy > MIN_FLICK_DISTANCE && g.vy > DISMISS_VELOCITY)) {
            onCloseRef.current();
            return;
          }
          Animated.spring(translateY, { toValue: 0, bounciness: 0, speed: 20, useNativeDriver: false }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateY, { toValue: 0, bounciness: 0, speed: 20, useNativeDriver: false }).start();
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [translateY],
  );

  // The dim eases off a little as the card is pulled down.
  const dragDim = translateY.interpolate({
    inputRange: [0, 400],
    outputRange: [1, 0.35],
    extrapolate: "clamp",
  });
  const scrimOpacity = useMemo(() => Animated.multiply(fade, dragDim), [fade, dragDim]);

  const handleClose = useCallback(() => {
    if (dismissibleRef.current) onCloseRef.current();
  }, []);

  const body = (
    <>
      <Animated.View pointerEvents="none" style={[styles.scrim, scrimStyle, { opacity: scrimOpacity }]} />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
      />
      <Animated.View
        style={[styles.sheet, sheetStyle, { transform: [{ translateY }] }]}
        onLayout={(event) => {
          sheetHeight.current = event.nativeEvent.layout.height;
        }}
        {...panResponder.panHandlers}
      >
        <SheetScrollContext.Provider value={scrollOffset}>{children}</SheetScrollContext.Provider>
      </Animated.View>
    </>
  );

  return (
    <Modal
      visible={mounted}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={() => onCloseRef.current()}
    >
      {ownSafeArea ? (
        <SafeAreaProvider style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {body}
        </SafeAreaProvider>
      ) : (
        body
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: WarshAlpha.scrim },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0 },
});
