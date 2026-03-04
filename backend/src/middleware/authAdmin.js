import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  console.log("---- AUTH MIDDLEWARE HIT ----");
  console.log("Authorization header:", req.headers.authorization);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    console.log("TOKEN RECEIVED:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED TOKEN:", decoded);

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authAdmin;
