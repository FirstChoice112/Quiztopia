// Importera nödvändiga moduler från AWS SDK v3 och fs för filhantering
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { promises as fs } from "fs";

// Skapa en DynamoDB-klient för din region
const client = new DynamoDBClient({ region: "eu-north-1" });
const dynamoDB = DynamoDBDocumentClient.from(client); // DynamoDBDocumentClient ger ett lättare sätt att hantera JSON

// Async-funktion för att läsa quizdata från JSON-filen
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

// Huvudfunktionen som skriver in data till DynamoDB
async function seedQuizzes() {
  const quizzes = await getQuizzesData(); // Hämta quizdata
  const params = {
    RequestItems: {
      "QuizzesTable-dev": quizzes, // Ändra till din faktiska DynamoDB-tabell om nödvändigt
    },
  };

  try {
    const result = await dynamoDB.send(new BatchWriteCommand(params)); // Skicka batch-skriv-kommandot
    console.log("Data har lagts till:", result);
  } catch (error) {
    console.error("Fel vid batch-inläggning:", error);
  }
}

// Kör funktionen för att lägga till quiz-data
seedQuizzes();
