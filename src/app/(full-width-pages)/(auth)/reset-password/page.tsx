import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | NullByte Neural Dashboard",
  description: "Securely recover your NullByte Neural Dashboard access. Administrative account recovery protocol.",
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
