const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "urban_edtech_jwt_secret_key_2026";

/**
 * JWT Authentication Middleware
 * Extracts and verifies Bearer tokens from the HTTP Authorization header.
 * Attaches decoded user payload ({ id, name, email, role }) to req.user.
 */
const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No JWT authorization token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid or expired JWT token.",
      error: err.message,
    });
  }
};

/**
 * Role Authorization Middleware
 * Enforces role-based access control (e.g. Admin or Instructor only)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. User role not found in JWT claims.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(", ")}]`,
      });
    }

    next();
  };
};

module.exports = {
  verifyJWT,
  requireRole,
};
