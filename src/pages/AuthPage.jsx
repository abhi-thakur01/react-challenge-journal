import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function getAuthMessage(error) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "Is email se account pehle se bana hua hai. Login karein.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Email ya password incorrect hai.";
    case "auth/user-not-found":
      return "Is email se koi account nahi mila.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Valid email address enter karein.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Authentication nahi ho saki. Firebase Authentication settings check karein.";
  }
}

export default function AuthPage({ mode = "login" }) {
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/roadmap";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setSubmitting(false);
  }, [mode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isSignup && password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setSubmitting(true);

    try {
      if (isForgot) {
        await resetPassword(email.trim());
        setSuccess(
          "Password reset link aapke email par has been sent. Inbox ya spam folder check karein."
        );
      } else if (isSignup) {
        await signup(email.trim(), password);
        navigate(
          redirect.startsWith("/") ? redirect : "/roadmap",
          { replace: true }
        );
      } else {
        await login(email.trim(), password);
        navigate(
          redirect.startsWith("/") ? redirect : "/roadmap",
          { replace: true }
        );
      }
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setSubmitting(false);
    }
  }

  const title = isForgot
    ? "Reset your password"
    : isSignup
      ? "Create your account"
      : "Welcome back";
  const subtitle = isForgot
    ? "Email enter karein, hum aapko secure reset link bhejenge."
    : isSignup
      ? "Apna React learning journey start karein."
      : "Welcome back to your Frontend Learning Challenge.";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="input pl-10"
              />
            </div>
          </div>

          {!isForgot && (
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="input pl-10"
                />
              </div>
            </div>
          )}

          {isSignup && (
            <div>
              <label htmlFor="confirm-password" className="label">
                Confirm password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  className="input pl-10"
                />
              </div>
            </div>
          )}

          {!isSignup && !isForgot && (
            <div className="-mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-300"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-300"
            >
              <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0" />
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {isForgot
              ? "Send reset link"
              : isSignup
                ? "Create account"
                : "Login"}
          </button>

          {isForgot ? (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          ) : (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {isSignup ? "Already have an account?" : "New to React Journal?"}{" "}
              <Link
                to={`${isSignup ? "/login" : "/signup"}${location.search}`}
                className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
              >
                {isSignup ? "Login" : "Sign up"}
              </Link>
            </p>
          )}
        </form>
      </div>
    </main>
  );
}