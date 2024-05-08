const jwt = require('jsonwebtoken');
const JWT_SECRET = 'qwerty';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (err) {
            return res.status(401).json({ error: 'Authentication Failed!' });
        }
    }
    else {
        return res.status(401).json({ error: 'Authentication Failed!' });
    }
}

module.exports = verifyToken;