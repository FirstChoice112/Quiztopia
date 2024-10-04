import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDB = new DynamoDBClient({ region: "eu-north-1" });

export const getAllQuizzes = async () => {
  const params = {
    TableName: "QuizzesTable-dev",
  };

  try {
    const data = await dynamoDB.send(new ScanCommand(params));

    if (!data.Items || data.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `No Quizzes found. 🥲`,
        }),
      };
    }

    const quizzes = data.Items.map((item) => {
      const quiz = unmarshall(item);
      return {
        quizName: quiz.quizName,
        userName: quiz.userName,
      };
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ quizzes }),
    };
  } catch (err) {
    console.error("Error fetching quizes 🤥:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error 😶‍🌫️",
      }),
    };
  }
};
