import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { IconCheck, IconX, IconLoader2 } from "@tabler/icons-react";

export const Route = createFileRoute("/auth/finish")({
  component: RouteComponent,
});

function RouteComponent() {
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const verifySignInLink = async () => {
      // Check if this is a valid sign-in link
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setStatus("error");
        setError("Invalid or expired sign-in link. Please request a new one.");
        return;
      }

      // Get email from localStorage
      const userEmail = window.localStorage.getItem("emailForSignIn");

      if (!userEmail) {
        // User opened link on different device
        setNeedsEmail(true);
        setStatus("error");
        setError("Please enter your email address to complete sign-in.");
        return;
      }

      // Proceed with sign-in
      try {
        await signInWithEmailLink(auth, userEmail, window.location.href);

        // Clear email from storage
        window.localStorage.removeItem("emailForSignIn");

        setStatus("success");

        // Redirect to home or dashboard after 2 seconds
        setTimeout(() => {
          navigate({ to: "/home" });
        }, 1000);
      } catch (err: any) {
        console.error("Sign-in error:", err);
        setStatus("error");

        if (err.code === "auth/email-already-in-use") {
          setError(
            "This email is already registered. The email link sign-in might be misconfigured. Please contact support or try a different sign-in method.",
          );
        } else if (err.code === "auth/invalid-action-code") {
          setError(
            "This sign-in link has expired or has already been used. Please request a new one.",
          );
        } else if (err.code === "auth/invalid-email") {
          setError("The email address is invalid. Please check and try again.");
        } else {
          setError(err.message || "Failed to sign in. Please try again.");
        }
      }
    };

    verifySignInLink();
  }, [auth, navigate]);

  const handleSignIn = async (providedEmail: string | null = null) => {
    setStatus("verifying");
    setError("");

    // Check if this is a valid sign-in link
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setStatus("error");
      setError("Invalid or expired sign-in link. Please request a new one.");
      return;
    }

    // Get email from localStorage or prompt
    const userEmail =
      providedEmail || window.localStorage.getItem("emailForSignIn");

    if (!userEmail) {
      // User opened link on different device
      setNeedsEmail(true);
      setStatus("error");
      setError("Please enter your email address to complete sign-in.");
      return;
    }

    try {
      await signInWithEmailLink(auth, userEmail, window.location.href);

      // Clear email from storage
      window.localStorage.removeItem("emailForSignIn");

      setStatus("success");

      // Redirect to home or dashboard after 2 seconds
      setTimeout(() => {
        navigate({ to: "/home" });
      }, 1000);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setStatus("error");

      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. The email link sign-in might be misconfigured. Please contact support or try a different sign-in method.",
        );
      } else if (err.code === "auth/invalid-action-code") {
        setError(
          "This sign-in link has expired or has already been used. Please request a new one.",
        );
      } else if (err.code === "auth/invalid-email") {
        setError("The email address is invalid. Please check and try again.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setNeedsEmail(false);
      handleSignIn(email);
    }
  };

  // Email input form for different device
  if (needsEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card bg-base-100 border-base-200 w-full max-w-md border p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="bg-warning/10 text-warning mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <IconX width="32" height="32" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Confirm Your Email</h1>
            <p className="text-base-content/70 text-sm">
              You opened this link on a different device. Please enter your
              email address to continue.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && email) {
                      handleEmailSubmit(e);
                    }
                  }}
                  autoFocus
                  required
                />
              </label>
            </div>

            {error && (
              <div className="alert alert-error py-2 text-sm">
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleEmailSubmit}
              disabled={!email}
              className="btn btn-primary"
            >
              Continue
            </button>

            <button
              onClick={() => navigate({ to: "/auth" })}
              className="btn btn-ghost btn-sm"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verifying state
  if (status === "verifying") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card bg-base-100 border-base-200 w-full max-w-md border p-12 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="text-primary mb-4">
              <IconLoader2 width="48" height="48" className="animate-spin" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Verifying...</h1>
            <p className="text-base-content/70 text-sm">
              Please wait while we sign you in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card bg-base-100 border-base-200 w-full max-w-md border p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="bg-error/10 text-error mb-4 rounded-full p-4">
              <IconX width="48" height="48" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Sign-in Failed</h1>
            <p className="text-base-content/70 mb-6 text-sm">{error}</p>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => navigate({ to: "/auth" })}
                className="btn btn-primary"
              >
                Request New Link
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-ghost btn-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card bg-base-100 border-base-200 w-full max-w-md border p-12 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="bg-success/10 text-success mb-4 rounded-full p-4">
            <IconCheck width="48" height="48" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Welcome back!</h1>
          <p className="text-base-content/70 text-sm">
            You've been successfully signed in. Redirecting...
          </p>
        </div>
      </div>
    </div>
  );
}
