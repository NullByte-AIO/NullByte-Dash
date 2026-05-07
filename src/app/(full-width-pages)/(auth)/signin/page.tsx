import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NullByte NeuralDashboard",
  description: "This is a Neural Dashboard specific for NullByte associated Tools, built by KrArjan."
};

export default function SignIn() {
  return <SignInForm />;
}
