import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { promises as fs } from "fs";

const client = new DynamoDBClient({ region: "eu-north-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);
const getQuizzesData = async () => {
  const data = await fs.readFile(
    new URL("./quizzes.json", import.meta.url),
    "utf-8"
  );
  return JSON.parse(data).map((quiz) => ({
    PutRequest: {
      Item: {
        quizId: quiz.quizId,
        userId: quiz.userId,
        quizName: quiz.quizName,
        userName: quiz.userName,
        questions: quiz.questions.map((question) => ({
          question: question.question,
          answer: question.answer,
          location: {
            longitude: question.location.longitude,
            latitude: question.location.latitude,
          },
        })),
      },
    },
  }));
};

async function seedQuizzes() {
  const quizzes = await getQuizzesData();
  const params = {
    RequestItems: {
      "QuizzesTable-dev": quizzes,
    },
  };

  try {
    const result = await dynamoDB.send(new BatchWriteCommand(params));
    console.log("Quiz seeding succeeded 😊:", result);
  } catch (error) {
    console.error("Quiz seeding failed 😶‍🌫️:", error);
  }
}

seedQuizzes();
