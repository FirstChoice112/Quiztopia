import { registerUser } from "./src/register.js";
import { loginUser } from "./src/login.js";

export const handler = async (event) => {
  const { path, httpMethod } = event;

  if (httpMethod === "POST" && path === "/register") {
    return registerUser(event);
  } else if (httpMethod === "POST" && path === "/login") {
    return loginUser(event);
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "URL not found, handlerError 😶‍🌫️" }),
    };
  }
};
