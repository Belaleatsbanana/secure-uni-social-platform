import jwt from "jsonwebtoken";

/*
  Middleware to verify JWT tokens for protected routes. 
  It checks for the presence of the token in the Authorization header, 
  verifies it using the secret key, and attaches the decoded user information to the request object. 
  If the token is missing, invalid, or expired, it responds with appropriate error messages.
*/

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trimStart();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token." });
    }
    console.error("Token verification error:", err.message);
    res.status(500).json({ error: "Authentication failed" });
  }
};
