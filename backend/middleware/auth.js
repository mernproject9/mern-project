const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "urban_edtech_jwt_secret_key_2026_antigravity";

/**
 * Task 1 & Task 2: Parse and verify JWT from Authorization header
 * - Extract token from request header ("Bearer <token>")
 * - Verify token signature and decode payload
 * - Attach decoded user info to req.user
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Access token missing or invalid format. Please provide a Bearer token in the Authorization header."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user payload ({ id, name, email, role }) to request object
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired access token.",
      details: err.message
    });
  }
};

/**
 * Task 3: Check user role in decoded JWT against required role for route.
 * - Reusable across multiple routes.
 * - Returns 403 Forbidden if user role does not match required role.
 * 
 * Usage: authorizeRoles("admin") or authorize("student", "admin")
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required before authorization check."
      });
    }

    const userRole = req.user.role ? req.user.role.toLowerCase() : "";
    const normalizedAllowed = allowedRoles.map((role) => role.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Forbidden: Access denied for role '${req.user.role}'. Required role: ${allowedRoles.join(" or ")}.`
      });
    }

    next();
  };
};

/**
 * Helper to generate JWT Token for a user payload
 */
const generateToken = (userPayload, expiresIn = "7d") => {
  return jwt.sign(
    {
      id: userPayload._id || userPayload.id,
      name: userPayload.name,
      email: userPayload.email,
      role: userPayload.role || "student"
    },
    JWT_SECRET,
    { expiresIn }
  );
};

// Aliases for comprehensive naming conventions across codebase
const authenticateToken = verifyToken;
const authorizeRoles = authorize;
const checkRole = authorize;

module.exports = {
  verifyToken,
  authenticateToken,
  authorize,
  authorizeRoles,
  checkRole,
  generateToken,
  JWT_SECRET
};
