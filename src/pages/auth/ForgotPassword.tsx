import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type DefaultProps from "@/types/pages/defaultProps.interface";
import useNavigate from "@/hooks/useNavigate";
import { cn } from "@/lib/utils";

// Placeholder API function — replace with real service
async function sendForgotPasswordEmail(email: string) {
  // simulate API call
  console.log(email);

  return new Promise<{ success: boolean; message?: string }>((res) =>
    setTimeout(() => res({ success: true }), 800)
  );
}

export default function ForgotPassword({
  ...props
}: React.ComponentProps<"div"> & DefaultProps) {
  console.log(props);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    // simple email regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? null : "Please enter a valid email";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateEmail(email);
    setError(v);
    if (v) return;

    setLoading(true);
    try {
      const res = await sendForgotPasswordEmail(email);
      if (res.success) {
        toast.success("If the email exists, a reset link was sent.");
        navigate("/auth/login");
      } else {
        toast.error(res.message || "Failed to send reset email");
      }
    } catch (err) {
      console.log(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  className="border border-gray-200"
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              <div className="text-center text-sm">
                Back home?
                <button
                  type="button"
                  className="underline"
                  onClick={() => navigate("/auth/login")}
                >
                  Login
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
