import { docClient } from "../utils/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const registerUser = async (event) => {
  const { username, password } = JSON.parse(event.body);

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing username and password is required 🤥",
      }),
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  const params = {
    TableName: process.env.DYNAMODB_USERS_TABLE,
    Item: {
      userId,
      username,
      password: hashedPassword,
    },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User registered successfully 😊",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error registering user 😶‍🌫️",
      }),
    };
  }
};

export { registerUser };
