import "./styles/App.css";

import Dashboard from "./components/Dashboard";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

// Initialize Apollo Client
const client = new ApolloClient({
  uri: "http://localhost:4001/graphql", // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: "include",
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className='micro-frontend-container'>
        <Dashboard />
      </div>
    </ApolloProvider>
  );
}

export default App;
