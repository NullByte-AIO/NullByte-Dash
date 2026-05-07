import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NullByte NeuralDashboard",
  description: "This is a Neural Dashboard specific for NullByte associated Tools, built by KrArjan."
};

export default function SignUp() {
  return <SignUpForm />;
}
