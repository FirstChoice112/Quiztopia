import middy from "@middy/core";
import { registerUser } from "./src/register.js";
import { loginUser } from "./src/login.js";
import { getQuiz } from "./quizzes/getQuiz.js";
import { getAllQuizzes } from "./quizzes/getAllQuizzes.js";
import { createQuiz } from "./quizzes/createQuiz.js";
import { addQuestionToQuiz } from "./quizzes/addQuestion.js";
import { handleDeleteQuiz } from "./quizzes/deleteQuiz.js";
import { validateToken } from "./utils/authMiddleware.js";

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
        body: JSON.stringify({ message: "QuizId saknas 🥲." }),
      };
    }
  } else if (httpMethod === "POST" && path === "/quizzes") {
    return authHandler(event);
  } else if (
    httpMethod === "POST" &&
    path.startsWith("/quizzes/") &&
    path.endsWith("/questions")
  ) {
    return addQuestionHandler(event);
  } else if (httpMethod === "DELETE" && path.startsWith("/quizzes/")) {
    if (quizId) {
      return handleDeleteQuiz(event);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "QuizId saknas 🥲." }),
      };
    }
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "URL not found, handlerError 😶‍🌫️" }),
    };
  }
};

const createQuizHandler = async (event) => {
  return createQuiz(event);
};
const addQuestionHandler = async (event) => {
  return addQuestionToQuiz(event);
};
const deleteQuizHandler = async (event) => {
  return handleDeleteQuiz(event);
};
export const main = handler;
export const authHandler = middy(createQuizHandler).use(validateToken);
export const addQuestion = middy(addQuestionHandler).use(validateToken);
export const deleteQuiz = middy(deleteQuizHandler).use(validateToken);
