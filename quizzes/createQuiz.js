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
        body: JSON.stringify({ message: "UserId missing, unauthorized 🛑" }),
      };
    }

    const { title, questions } = JSON.parse(event.body);

    if (!title || !questions || !Array.isArray(questions)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Title and questions are required 🤥",
        }),
      };
    }

    // Hämta alla quiz för att bestämma högsta quizId
    const scanParams = {
      TableName: "QuizzesTable-dev",
    };

    const scanCommand = new ScanCommand(scanParams);
    const scanResult = await docClient.send(scanCommand);
    // Standardvärde om inga quiz hittas
    let newQuizId = 1;
    if (scanResult.Items.length > 0) {
      // Hämta högsta quizId och inkrementera
      const quizIds = scanResult.Items.map((item) => parseInt(item.quizId, 10));
      newQuizId = Math.max(...quizIds) + 1;
    }

    const quizData = {
      userId,
      userName,
      quizId: newQuizId.toString(), // konvertera till sträng
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
        message: "Quiz created successfully 😊",
        quizId: quizData.quizId,
      }),
    };
  } catch (err) {
    console.error("Error creating quiz 😶‍🌫️:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Kunde inte skapa quiz 🥲" }),
    };
  }
};
