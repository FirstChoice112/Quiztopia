import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const validateToken = {
  before: async (req) => {
    try {
      const authHeader =
        req.event.headers.authorization || req.event.headers.Authorization;

      if (!authHeader) throw new Error("No token provided 🤥");

      const token = authHeader.replace("Bearer ", "");

      const data = jwt.verify(token, process.env.JWT_SECRET);

      req.event.userId = data.userId;
      req.event.userName = data.username;

      return req.response;
    } catch (error) {
      throw new Error("Unauthorized 🛑");
    }
  },
};

export { validateToken };
