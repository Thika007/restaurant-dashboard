import jwt from 'jsonwebtoken';
import authService from '../services/authService.js';

export const login = async (req, res) => {
    const { userId, password } = req.body;

    try {
        if (!userId || !password) {
            return res.status(400).json({ message: "User ID and password are required" });
        }

        const user = await authService.validateUser(userId, password);

        if (!user) {
            return res.status(401).json({ message: "Invalid User ID or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.user_id,
                locationId: user.location_id,
                supervisor: user.supervisor,
                alowmaster: user.alowmaster
            },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                userId: user.user_id,
                locationId: user.location_id,
                supervisor: user.supervisor,
                alowmaster: user.alowmaster
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            details: error.message,
            code: error.code
        });
    }
};

export default {
    login
};
