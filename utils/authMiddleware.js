import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
// const validateToken = {
//   before: async (req) => {
//     try {
//       console.log("Event object:", req.event);

//       const token = req.event.headers.authorization.replace("Bearer ", "");

//       if (!token) throw new Error("No token provided");

//       const data = jwt.verify(token, JWT_SECRET);

//       req.event.userId = data.userId;
//       return req.response;
//     } catch (error) {
//       console.error("Token verification failed:", error.message);
//       throw new Error("Unauthorized");
//     }
//   },
// };
const validateToken = {
  before: async (req) => {
    try {
      console.log("Event object:=======>", req.event);
      const authHeader =
        req.event.headers.authorization || req.event.headers.Authorization;

      if (!authHeader) throw new Error("No token provided");

      const token = authHeader.replace("Bearer ", "");

      console.log("Token:=========>", token);

      const data = jwt.verify(token, process.env.JWT_SECRET);

      req.event.userId = data.userId;

      console.log("UserId from token:=====>", req.event.userId);

      return req.response;
    } catch (error) {
      console.error("Token verification failed:", error.message);
      throw new Error("Unauthorized");
    }
  },
};

export { validateToken };
