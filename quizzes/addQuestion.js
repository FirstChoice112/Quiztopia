import { docClient, GetCommand, UpdateCommand } from "../utils/db.js";
export const addQuestionToQuiz = async (event) => {
  const { quizId } = event.pathParameters;
  const { userId, question, answer, coordinates } = JSON.parse(event.body);

  // Hämta quizet från DynamoDB
  const getParams = {
    TableName: "QuizzesTable-dev",
    Key: {
      userId,
      quizId,
    },
  };

  try {
    const quizData = await docClient.send(new GetCommand(getParams));

    if (!quizData.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Quiz not found or you don't have permission to edit it 🛑",
        }),
      };
    }

    // Kontrollera att userId i quizet matchar det skickade userId
    if (quizData.Item.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "You are not allowed to edit this quiz 🛑",
        }),
      };
    }

    // Lägg till frågan i quizet
    const updateParams = {
      TableName: "QuizzesTable-dev",
      Key: {
        userId,
        quizId,
      },
      UpdateExpression:
        "SET questions = list_append(if_not_exists(questions, :emptyList), :newQuestion)",
      ExpressionAttributeValues: {
        ":emptyList": [],
        ":newQuestion": [
          {
            question,
            answer,
            coordinates: {
              longitude: coordinates.longitude,
              latitude: coordinates.latitude,
            },
          },
        ],
        s,
      },
      ReturnValues: "UPDATED_NEW",
    };

    const result = await docClient.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Question added successfully 😊",
        updatedQuiz: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error adding question:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error adding question 🤥", error }),
    };
  }
};
