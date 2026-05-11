/**
 * Authentication Middleware
 *
 * Validates Supabase JWT tokens on protected API routes.
 * The frontend sends the Supabase access token in the Authorization header.
 *
 * Usage:
 *   import { authenticate } from "./middleware/auth.js";
 *   router.get("/protected", authenticate, handler);
 */

/**
 * Middleware to verify Supabase JWT and attach user to req.user.
 * TODO: Install @supabase/supabase-js and configure the admin client.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice(7);

  try {
    // TODO: Verify token with Supabase admin client
    // const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    // if (error || !user) throw new Error("Invalid token");
    // req.user = user;

    // Placeholder — remove when Supabase admin client is configured
    if (!token) throw new Error("No token provided");
    req.user = { id: "placeholder", role: "authenticated" };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/**
 * Middleware to restrict access to admin users only.
 * Must be used after `authenticate`.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

/**
 * Middleware to restrict access to security staff.
 * Must be used after `authenticate`.
 */
export function requireSecurity(req, res, next) {
  const allowedRoles = ["admin", "security"];
  if (!allowedRoles.includes(req.user?.role)) {
    return res.status(403).json({ error: "Security access required" });
  }
  next();
}
