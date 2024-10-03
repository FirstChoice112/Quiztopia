import { docClient } from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const loginUser = async (event) => {
  const { username, password } = JSON.parse(event.body);

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Username and password is required",
      }),
    };
  }

  const params = {
    TableName: "UsersTable-dev",
    IndexName: "UsernameIndex",
    KeyConditionExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": username,
    },
  };

  try {
    const command = new QueryCommand(params);
    const { Items } = await docClient.send(command);

    if (!Items || Items.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid username or password 🤥" }),
      };
    }

    const user = Items[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid username or password 🤥" }),
      };
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login successful 😊", token }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not login user 🥲" }),
    };
  }
};

export { loginUser };
