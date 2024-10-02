import { registerUser } from "./src/register.js";
import { loginUser } from "./src/login.js";
import { getQuiz } from "./quizzes/getQuiz.js";
import { getAllQuizzes } from "./quizzes/getAllQuizzes.js";

export const handler = async (event) => {
  const { path, httpMethod, pathParameters } = event;

  if (httpMethod === "POST" && path === "/register") {
    return registerUser(event);
  } else if (httpMethod === "POST" && path === "/login") {
    return loginUser(event);
  } else if (httpMethod === "GET" && path === "/quizzes") {
    // Hämta alla quizzes
    return getAllQuizzes();
  } else if (httpMethod === "GET" && path.startsWith("/quizzes/")) {
    // Kontrollera om quizId finns i pathParameters
    const quizId = pathParameters?.quizId;

    if (quizId) {
      // Hämta specifikt quiz
      return getQuiz(event);
    } else {
      // Hantera fall där inga `quizId` ges
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Quiz ID saknas." }),
      };
    }
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "URL not found, handlerError 😶‍🌫️" }),
    };
  }
};
