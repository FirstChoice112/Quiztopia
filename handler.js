import middy from "@middy/core";
import { registerUser } from "./src/register.js";
import { loginUser } from "./src/login.js";
import { getQuiz } from "./quizzes/getQuiz.js";
import { getAllQuizzes } from "./quizzes/getAllQuizzes.js";
import { createQuiz } from "./quizzes/createQuiz.js";
import { validateToken } from "./utils/authMiddleware.js";

// Gemensam handler för gamla endpoints
const handler = async (event) => {
  const { path, httpMethod, pathParameters } = event;

  if (httpMethod === "POST" && path === "/register") {
    return registerUser(event);
  } else if (httpMethod === "POST" && path === "/login") {
    return loginUser(event);
  } else if (httpMethod === "GET" && path === "/quizzes") {
    return getAllQuizzes();
  } else if (httpMethod === "GET" && path.startsWith("/quizzes/")) {
    const quizId = pathParameters?.quizId;

    if (quizId) {
      return getQuiz(event);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Quiz ID saknas." }),
      };
    }
  } else if (httpMethod === "POST" && path === "/quizzes") {
    // För nya endpoints med auth, returnera en 404 om det är en gammal endpoint
    return authHandler(event);
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "URL not found, handlerError 😶‍🌫️" }),
    };
  }
};

// Ny handler för createQuiz med Middy
const createQuizHandler = async (event) => {
  return createQuiz(event);
};

// Exportera en separat handler med Middy för specifika endpoints
export const main = handler; // För gamla endpoints
export const authHandler = middy(createQuizHandler).use(validateToken); // För nya endpoints
