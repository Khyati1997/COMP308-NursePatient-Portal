// apolloClient.js
import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
  } from "@apollo/client";
  
  // Create an HTTP link with credentials for cookie-based auth
  const httpLink = createHttpLink({
    uri: "http://localhost:4001/graphql", // 🔁 Change this if your GraphQL server is on a different port
    credentials: "include", // ⬅️ ensures cookies are sent
  });
  
  // Create and export the Apollo Client
  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
  
  export default client;
  