import { docClient, GetCommand, DeleteCommand } from "../utils/db.js";

export const handleDeleteQuiz = async (event) => {
  const { quizId } = event.pathParameters;
  const { userId } = JSON.parse(event.body);

  const getParams = {
    TableName: "QuizzesTable-dev",
    Key: {
      userId,
      quizId,
    },
  };

  try {
    const quizData = await docClient.send(new GetCommand(getParams));

    // Kontrollera att quizet finns
    if (!quizData.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message:
            "Quiz not found or you don't have permission to delete it 🛑",
        }),
      };
    }

    // Kontrollera att userId i quizet matchar det skickade userId
    if (quizData.Item.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "You are not allowed to delete this quiz 🛑",
        }),
      };
    }

    const deleteParams = {
      TableName: "QuizzesTable-dev",
      Key: {
        userId,
        quizId,
      },
    };

    await docClient.send(new DeleteCommand(deleteParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Quiz deleted successfully 😊",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error deleting quiz 🥲",
        error: error.message,
      }),
    };
  }
};
