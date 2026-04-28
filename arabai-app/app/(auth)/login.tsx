import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/(app)");
    } catch (err) {
      setError("Unable to sign in. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>Login</Text>
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
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12, marginBottom: 12 }}
      />
      {error ? <Text style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</Text> : null}
      <Pressable
        onPress={handleSubmit}
        style={{ backgroundColor: "#0f766e", padding: 16, borderRadius: 12, marginBottom: 24 }}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Sign In</Text>}
      </Pressable>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <Text>Don't have an account? </Text>
        <Link href="/(auth)/register" style={{ color: "#0f766e", fontWeight: "bold" }}>
          Register
        </Link>
      </View>
    </View>
  );
}
