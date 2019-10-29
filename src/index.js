import { GraphQLServer } from 'graphql-yoga';
import { posts, users, comments } from './seed/data';

const typeDefs = `
  type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
    me: User!
    post: Post!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
  }

  type Comment {
    id: ID!,
    text: String!
  }

`;

const resolvers = {
  Query: {
    users: (parent, args, ctx, info) => {
      if (!args.query) {
        return users;
      }
      return users.filter((user) => {
        return user.name.toLocaleLowerCase().includes(args.query.toLocaleLowerCase);
      });
    },
    posts: (parent, args, ctx, info) => {
      if (!args.query) return posts;

      return posts.filter((post) => {
        const titleMatch = post.title.toLowercase().includes(args.query.toLocaleLowerCase());
        const bodyMatch = post.body.toLowercase().includes(args.query.toLocaleLowerCase());
        return titleMatch || bodyMatch;
      });
    },
    comments: (parent, args, ctx, info) => {
      return comments;
    },
    me: () => ( ({
      id: '35523fdsd-23434',
      name: 'Gudo',
      email: 'haha@gmail.com'
    })),
    post: () => ({
      id: '21345-12313',
      title: 'Ang kawawang cowboy',
      body: 'May baril walang bala',
      published: false
    })
  },
  Post: {
    author: (parent, args, ctx, info) => {
      return users.find(user => user.id === parent.author);
    }
  },
  User: {
    posts: (parent, args, ctx, info) => {
      return posts.filter(post => post.author === parent.id);
    }
  }
};

const server = new GraphQLServer({typeDefs, resolvers});

server.start(() => {
  console.log('Server is running');
});
