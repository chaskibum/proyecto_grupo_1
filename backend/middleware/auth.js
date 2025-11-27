const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "NO AUTORIZADO: falta token" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, "CLAVE_SECRETA_SUPER_SEGURA", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "TOKEN INVÁLIDO" });
        }

        req.user = decoded;
        next();
    });
}

module.exports = authMiddleware;