import { IconCheck, IconMail } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { sendSignInLinkToEmail } from "firebase/auth";
import { useState } from "react";
import z from "zod";
import { auth } from "../../../lib/firebase/auth";

const signInSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address." })
    .trim()
    .min(1, { message: "Email is required." })
    .max(100, { message: "Email cannot be longer than 100 characters." }),
});

interface AuthFormProps {
  mode?: "login" | "register";
}

export default function AuthForm({ mode = "login" }: AuthFormProps) {
  const [linkSent, setLinkSent] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isRegister = mode === "register";

  const form = useForm({
    defaultValues: {
      email: "",
    },

    validators: {
      onChange: signInSchema,
    },

    onSubmit: async ({ value }) => {
      setSubmitError("");
      const actionCodeSettings = {
        url: window.location.origin + "/auth/finish",
        handleCodeInApp: true,
      };

      try {
        await sendSignInLinkToEmail(auth, value.email, actionCodeSettings);
        window.localStorage.setItem("emailForSignIn", value.email);
        setLinkSent(true);
      } catch (err) {
        console.error("Error sending email link:", err);
      }
    },
  });

  const isSubmitting = form.state.isSubmitting;

  // Show success message after email is sent
  if (linkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card bg-base-100 border-base-200 w-full max-w-100 border p-12 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="bg-success/10 text-success mb-4 rounded-full p-4">
              <IconCheck width="48" height="48" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
            <p className="text-base-content/70 mb-6">
              We've sent a sign-in link to{" "}
              <strong>{form.state.values.email}</strong>
            </p>
            <p className="text-base-content/60 text-sm">
              Click the link in the email to complete your sign-in. The link
              will expire in 60 minutes.
            </p>
            <button
              onClick={() => {
                setLinkSent(false);
                form.reset();
              }}
              className="btn btn-ghost btn-sm mt-6"
            >
              Send to a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 font-family-sans">
      <div className="card bg-base-100 border-base-200 w-full max-w-110 border p-10 md:p-12 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold">
          {" "}
          {isRegister ? "Create account" : "Welcome"}
        </h1>
        <p className="text-base-content/70 mb-6 text-sm text-center">
          {isRegister
            ? "Join thousands of people who already sharing their wishlists with friends"
            : "Sign in to your account to continue"}
        </p>

        <div className="grid gap-2">
          <button className="btn border-[#e5e5e5] bg-white text-black">
            <svg
              aria-label="Google logo"
              width="18"
              height="18"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <g>
                <path d="m0 0H512V512H0" fill="transparent"></path>
                <path
                  fill="#34a853"
                  d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                ></path>
                <path
                  fill="#4285f4"
                  d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                ></path>
                <path
                  fill="#fbbc02"
                  d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                ></path>
                <path
                  fill="#ea4335"
                  d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                ></path>
              </g>
            </svg>
            Google
          </button>
        </div>

        <div className="my-4 flex items-center">
          <div className="bg-base-200 h-px flex-1"></div>
          <span className="text-base-content/60 px-3 text-sm">
            {isRegister ? "Or sign up with email" : "Or continue with email"}
          </span>
          <div className="bg-base-200 h-px flex-1"></div>
        </div>

        <div
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <form.Field
            name="email"
            children={(field) => {
              const { isTouched, errors } = field.state.meta;
              const hasValue = !!field.state.value;
              const hasError = isTouched && errors.length > 0;

              // Determine the message only if the field has been touched
              const message = isTouched
                ? hasValue
                  ? errors[0]?.message
                  : errors[1]?.message
                : null;

              return (
                <div>
                  <label
                    className={`input input-bordered w-full ${hasError ? "input-error border-error" : ""}`}
                  >
                    <IconMail
                      width="20"
                      height="20"
                      className={hasError ? "text-error" : ""}
                    />
                    <input
                      id={field.name}
                      name={field.name}
                      type="email"
                      disabled={isSubmitting}
                      value={field.state.value}
                      placeholder="you@example.com"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={hasError}
                      required
                      className={hasError ? "placeholder:text-error/50" : ""}
                    />
                  </label>
                  {message && (
                    <div className="mt-1.5 ml-1.5 text-xs text-error">
                      {message}
                    </div>
                  )}
                </div>
              );
            }}
          />

          {submitError && (
            <div className="alert alert-error py-2 text-sm">
              <span>{submitError}</span>
            </div>
          )}

          {isRegister && (
            <p className="text-xs cursor-pointer text-base-content/70">
              <span>By registering you agree to </span>
              <Link to="/legal/terms" className="link link-info font-medium">
                Terms & Conditions
              </Link>
            </p>
          )}

          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.isTouched,
              state.isDefaultValue,
            ]}
            children={([
              canSubmit,
              isSubmitting,
              isTouched,
              isDefaultValue,
            ]) => {
              const disabledSubmit = !canSubmit || !isTouched || isDefaultValue;

              return (
                <div className="flex w-full flex-col gap-2">
                  <button
                    type="submit"
                    className="btn btn-block btn-primary mt-2 h-10 text-[14px] font-semibold"
                    disabled={isSubmitting || disabledSubmit}
                    onClick={() => form.handleSubmit()}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Sending link...
                      </>
                    ) : isRegister ? (
                      "Create account"
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>
              );
            }}
          />
        </div>

        <div className="text-base-content/70 mt-6 text-center text-xs">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link
                to="/auth"
                search={{ tab: "login" }}
                className="link link-info font-medium"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                to="/auth"
                search={{ tab: "register" }}
                className="link link-info font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
