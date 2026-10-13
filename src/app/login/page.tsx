"use client";

import { LoginScreen } from "@/components/LoginScreen";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginScreen onBackToWelcome={() => router.push("/")} />
  );
}
