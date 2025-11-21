
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginPageClient from "./loginPageClient";


const LoginPage = async () => {
  // Redirect if already logged in
  if (await getSession()) redirect("/home");

  return <LoginPageClient />;
};

export default LoginPage;


