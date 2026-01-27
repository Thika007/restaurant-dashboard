import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
            req.user = decoded;
            console.log(`[AUTH] User: ${decoded.userId}, Location: ${decoded.locationId}`);
            return next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

export default {
    protect
};
