const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "urban_edtech_jwt_secret_key_2026_safe";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No authentication token provided." });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid authorization format. Format must be 'Bearer <token>'" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, role, email, name
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Forbidden: requires ${role} role permissions` });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
  JWT_SECRET,
};
