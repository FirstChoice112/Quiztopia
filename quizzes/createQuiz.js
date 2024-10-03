import { docClient } from "../utils/db.js";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const createQuiz = async (event) => {
  console.log("Received event in createQuiz:", JSON.stringify(event, null, 2));
  try {
    const userId = event.userId;
    const userName = event.userName;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "UserId saknas, obehörig" }),
      };
    }

    const { title, questions } = JSON.parse(event.body);

    if (!title || !questions || !Array.isArray(questions)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Title och questions är obligatoriska",
        }),
      };
    }

    // Hämta alla quiz för att bestämma högsta quizId
    const scanParams = {
      TableName: "QuizzesTable-dev",
    };

    const scanCommand = new ScanCommand(scanParams);
    const scanResult = await docClient.send(scanCommand);

    let newQuizId = 1; // Standardvärde om inga quiz hittas
    if (scanResult.Items.length > 0) {
      // Hämta högsta quizId och inkrementera
      const quizIds = scanResult.Items.map((item) => parseInt(item.quizId, 10));
      newQuizId = Math.max(...quizIds) + 1; // Öka med 1 av det högsta quizId
    }

    const quizData = {
      userId,
      userName,
      quizId: newQuizId.toString(), // Om du vill behålla det som sträng
      quizName: title,
      questions,
    };

    const params = {
      TableName: "QuizzesTable-dev",
      Item: quizData,
    };

    const command = new PutCommand(params);
    await docClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Quiz skapat framgångsrikt 😊",
        quizId: quizData.quizId,
      }),
    };
  } catch (err) {
    console.error("Error creating quiz:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Kunde inte skapa quiz 🥲" }),
    };
  }
};
