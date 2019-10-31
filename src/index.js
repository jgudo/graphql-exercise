import { GraphQLServer } from 'graphql-yoga';

import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import Post from './resolvers/Post';
import User from './resolvers/User';
import Comment from './resolvers/Comment';

import * as db from './db/data';

const server = new GraphQLServer({
  typeDefs: './schema.graphql', 
  resolvers: {
    Query,
    Mutation,
    Post,
    User,
    Comment
  },
  context: { db }
});

server.start(() => {
  console.log('Server is running');
});
