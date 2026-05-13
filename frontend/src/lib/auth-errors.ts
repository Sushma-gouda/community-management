import type { AuthError } from "@supabase/supabase-js";

/**
 * Maps Supabase Auth errors to short, user-facing messages.
 */
export function formatAuthError(
  error: AuthError | null | undefined,
  context: "signin" | "signup",
): string {
  if (!error?.message) {
    return context === "signin"
      ? "Could not sign you in. Please try again."
      : "Could not create your account. Please try again.";
  }

  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
    return "Invalid email or password.";
  }

  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered") ||
    msg.includes("already exists")
  ) {
    if (context === "signup") {
      return "An account with this email already exists. Try signing in instead.";
    }
  }

  if (msg.includes("email") && msg.includes("invalid")) {
    return "Please enter a valid email address.";
  }

  if (
    msg.includes("password") &&
    (msg.includes("least") || msg.includes("short") || msg.includes("long"))
  ) {
    return error.message;
  }

  if (msg.includes("weak") || msg.includes("strength")) {
    return error.message;
  }

  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return error.message;
}
