import { Alert, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { backend } from "@/services/backend";
import { useAuthStore } from "@/store/authStore";
import { palette } from "@/constants/theme";
import { useI18n } from "@/i18n/useI18n";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const deviceId = useAuthStore((state) => state.deviceId);
  const { t } = useI18n();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "driver@schooltransport.test",
      password: "password123"
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await backend.login({
        ...values,
        deviceInfo: {
          name: deviceId ?? "driver-device",
          platform: "mobile"
        }
      });
      await setSession(session);
      router.replace("/(app)/(tabs)/today");
    } catch (error) {
      Alert.alert("Login failed", error instanceof Error ? error.message : "Unable to sign in.");
    }
  });

  return (
    <AppScreen title={t("login")} subtitle="Use your driver account or complete QR enrollment on an approved device.">
      <Card style={styles.card}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <InputField
              label={t("email")}
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <InputField
              label={t("password")}
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />
        <Button label={t("signIn")} onPress={onSubmit} loading={isSubmitting} />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.helper}>Need first-time device pairing?</Text>
        <Link href="/(auth)/enrollment" style={styles.link}>
          {t("enrollment")}
        </Link>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16
  },
  footer: {
    alignItems: "center",
    gap: 6
  },
  helper: {
    color: palette.slate,
    fontSize: 14
  },
  link: {
    color: palette.ocean,
    fontSize: 15,
    fontWeight: "700"
  }
});
