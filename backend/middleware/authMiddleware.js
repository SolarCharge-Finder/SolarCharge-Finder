import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        [, token] = req.headers.authorization.split(" ");
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, token required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (typeof decoded === "string") {
            return res.status(401).json({ message: "Not authorized, invalid token payload" });
        }

        req.user = {
            id: decoded.id || decoded._id || decoded.sub,
            name: decoded.name || decoded.fullName || decoded.email || undefined,
        };

        if (!req.user.id) {
            return res.status(401).json({ message: "Not authorized, invalid token payload" });
        }

        return next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, token invalid" });
    }
};
