import { docClient } from "../utils/db.js";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export const createQuiz = async (event) => {
  console.log("Received event in createQuiz:", JSON.stringify(event, null, 2));
  try {
    // Hämta userId från event
    const userId = event.userId;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "UserId saknas, obehörig" }),
      };
    }

    // Fortsätt med quiz-skapande logiken
    const { title, questions } = JSON.parse(event.body);

    if (!title || !questions || !Array.isArray(questions)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Title och questions är obligatoriska",
        }),
      };
    }

    // Hämta högsta quizId för att generera nästa quizId
    const highestQuizIdParams = {
      TableName: "QuizzesTable-dev",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      Limit: 1,
      ScanIndexForward: false,
    };

    const highestQuizIdResult = new QueryCommand(highestQuizIdParams);
    const result = await docClient.send(highestQuizIdResult);

    let newQuizId = 1;
    if (result.Items.length > 0) {
      newQuizId = parseInt(result.Items[0].quizId) + 1;
    }

    const quizData = {
      userId,
      quizId: newQuizId.toString(),
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
