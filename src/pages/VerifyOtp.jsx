import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Shield, Loader2, ArrowLeft } from "lucide-react";
import { authAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const from = searchParams.get("from"); // 'register' or 'login'
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await authAPI.verifyOtp({ email, code: otpCode });
      
      // If verification response includes token, log user in automatically
      if (data.token) {
        localStorage.setItem("token", data.token);
        // Navigate directly to website
        navigate("/");
      } else {
        // Fallback: redirect to login with success message
        navigate("/login?verified=true");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResending(true);

    try {
      await authAPI.sendOtp({ email });
      setError("");
      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      // Focus first input
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <p className="text-destructive">Invalid verification link. Please register again.</p>
          <button
            onClick={() => navigate("/register")}
            className="mt-4 text-primary hover:underline"
          >
            Go to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Verify Your Email
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            Enter the 6-digit code sent to<br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-xl"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* OTP Inputs */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-foreground text-center">
              Verification Code
            </label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 rounded-lg border border-border bg-secondary text-center text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify Email
          </button>

<<<<<<< Updated upstream
=======


>>>>>>> Stashed changes
          {/* Resend OTP */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-1 text-sm font-medium text-primary hover:underline disabled:opacity-60"
            >
              {resending ? (
                <>
                  <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                  Sending...
                </>
              ) : (
                "Resend Code"
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
