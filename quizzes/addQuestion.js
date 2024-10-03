import { docClient, UpdateCommand } from "../utils/db.js";

export const addQuestionToQuiz = async (event) => {
  const { quizId } = event.pathParameters;
  const { question, answer, coordinates, userId } = JSON.parse(event.body);

  const params = {
    TableName: "QuizzesTable-dev",
    Key: { userId, quizId },
    UpdateExpression: "SET questions = list_append(questions, :newQuestion)",
    ExpressionAttributeValues: {
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
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await docClient.send(new UpdateCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Question added successfully 😊",
        updatedQuiz: result.Attributes,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error adding question 🤥", error }),
    };
  }
};
