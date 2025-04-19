const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Import JWT for token decoding
const db = require("./config/db");
const typeDefs = require("./schemas/user.schema");
const resolvers = require("./resolvers/user.resolver");

const app = express();

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("REQUEST Body:", req.body);
  console.log("RESPONSE Body: ", res.body);
  next();
});

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:4000",
      "https://studio.apollographql.com",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

// JWT Secret Key
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;

// Apollo Server with Context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {
    let user = null;

    // Extract token from cookies
    const token = req.cookies["token"];
    if (token) {
      try {
        // Decode the token
        user = jwt.verify(token, SECRET_KEY);
        console.log("Decoded User:", user);
      } catch (error) {
        console.error("Token verification failed:", error.message);
      }
    }

    // Return the context
    return { req, res, user };
  },
});

// Start the Server
server.start().then(() => {
  server.applyMiddleware({ app, cors: false });

  app.listen({ port: 4001 }, () =>
    console.log(`🚀 Server ready at http://localhost:4001${server.graphqlPath}`)
  );
});
