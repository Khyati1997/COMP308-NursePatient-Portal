const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("REQUEST Body:", req.body);
  next();
});

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:4001",
      "https://studio.apollographql.com",
    ],
    credentials: true,
  })
);

require("./routes/index.server.route")(app);

app.listen({ port: 4002 }, () =>
  console.log(`🚀 Server ready at http://localhost:4002`)
);
