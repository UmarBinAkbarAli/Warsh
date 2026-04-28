import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { useOnboardingStore } from "../stores/onboardingStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, login } = useAuth();
  const { name, language, goal } = useOnboardingStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(name, email, password, language, goal);
      await login(email, password);
      router.replace("/(app)");
    } catch (err) {
      setError("Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>Create Account</Text>
      <Text style={{ color: "#6b7280", marginBottom: 24 }}>Welcome {name}! Let's create your account.</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12, marginBottom: 12 }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12, marginBottom: 24 }}
      />
      {error ? <Text style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</Text> : null}
      <Pressable onPress={handleSubmit} style={{ backgroundColor: "#0f766e", padding: 16, borderRadius: 12 }} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Create Account</Text>}
      </Pressable>
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
        <Text>Already have an account? </Text>
        <Link href="/(auth)/login" style={{ color: "#0f766e", fontWeight: "bold" }}>
          Login
        </Link>
      </View>
    </View>
  );
}
