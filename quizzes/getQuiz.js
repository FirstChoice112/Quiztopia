import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDB = new DynamoDBClient({ region: "eu-north-1" });

export const getQuiz = async (event) => {
  const { quizId } = event.pathParameters;

  if (!quizId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Quiz ID missing 🤥." }),
    };
  }

  const params = {
    TableName: "QuizzesTable-dev",
    Key: {
      quizId: { S: quizId },
    },
  };

  try {
    const result = await dynamoDB.send(new GetItemCommand(params));

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `Quiz with ID ${quizId} not found. 🥲`,
        }),
      };
    }

    const quiz = unmarshall(result.Item);

    const questions = quiz.questions.map(({ question }) => ({
      question,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        quizName: quiz.quizName,
        userName: quiz.userName,
        questions,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error 😶‍🌫️" }),
    };
  }
};
