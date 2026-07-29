import { Platform, View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { TextInput } from "react-native-paper";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@hooks/useAuth";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { getApiErrorMessage } from "@services/api";
import { Colors, FontSizes, LineHeights, Spacing, WarshPalette } from "../../constants/theme";
import { trackLoginCompleted } from "@services/analytics";
import { GoogleAuthSection } from "@components/GoogleAuthSection";
import { WebAuthLayout } from "@components/WebAuthLayout";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  const desktopWeb = Platform.OS === "web" && width >= 900;

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      trackLoginCompleted();
      router.replace("/(app)");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to sign in. Check your credentials and try again."));
    } finally {
      setLoading(false);
    }
  }

  const content = (
    <View style={[styles.screen, desktopWeb ? styles.webScreen : null]}>
      {!desktopWeb ? <ArabicText size="sm" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </ArabicText> : null}
      <Text style={styles.heading}>Welcome back to Warsh</Text>
      <Text style={styles.subheading}>Pick up where you left off. Your next word is waiting.</Text>

      {!desktopWeb ? <GoogleAuthSection context="login" /> : null}

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, desktopWeb ? styles.webInput : null]}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry={!showPassword}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off-outline" : "eye-outline"}
            onPress={() => setShowPassword((value) => !value)}
            forceTextInputFocus={false}
          />
        }
        style={[styles.input, desktopWeb ? styles.webInput : null]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <BrandButton
        title="Sign In"
        onPress={handleSubmit}
        loading={loading}
        style={desktopWeb ? styles.webButton : undefined}
      />
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: Spacing.lg }}>
        <Text style={{ color: Colors.text.secondary }}>Don't have an account? </Text>
        <Link href="/(auth)/register" style={{ color: Colors.accent.gold, fontWeight: "700" }}>
          Register
        </Link>
      </View>
      <View style={{ alignItems: "center", marginTop: Spacing.sm }}>
        <Link href="/(auth)/forgot-password" style={{ color: Colors.text.secondary, fontFamily: "Lora-Regular", fontSize: FontSizes.bodyM }}>
          Forgot password?
        </Link>
      </View>
    </View>
  );

  return <WebAuthLayout>{content}</WebAuthLayout>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    padding: Spacing.xl,
    justifyContent: "center",
  },
  webScreen: {
    flex: undefined,
    width: "100%",
    padding: 0,
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
  heading: {
    color: Colors.text.primary,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL,
    fontWeight: "700",
    fontFamily: "Lora-Bold",
    marginBottom: Spacing.sm,
  },
  subheading: {
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    lineHeight: LineHeights.bodyL,
    fontFamily: "Lora-Regular",
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.bg.surface,
  },
  webInput: {
    backgroundColor: WarshPalette.white,
  },
  webButton: {
    backgroundColor: WarshPalette.navy,
    borderColor: WarshPalette.navy,
  },
  error: {
    color: Colors.text.danger,
    marginBottom: Spacing.md,
    fontFamily: "Lora-Regular",
  },
});
