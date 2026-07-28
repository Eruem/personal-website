import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F9F9F7] dot-grid-bg">
      <div className="w-full max-w-md border border-[#111111] bg-[#F9F9F7] p-8">
        <LoginForm />
      </div>
    </div>
  );
}
