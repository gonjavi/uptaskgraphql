const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/db');
const connectarDB = ('./config/db');

// conectar db
conectarDB();

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then( ({url}) => {
  console.log(`Servidor corriendo en la URL ${url}`)
}); 