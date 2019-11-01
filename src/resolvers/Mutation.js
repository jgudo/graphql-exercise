import uuidv4 from 'uuid/v4';

const Mutation = {
  createUser: (parent, args, { db }, info) => {
    const emailTaken = db.users.some(user => user.email === args.data.email);

    if (emailTaken) {
      throw new Error('Email already taken!');
    }

    const user = {
      ...args.data,
      id: uuidv4()
    }

    db.users.push(user);

    return user;
  },
  deleteUser: (parent, args, { db }, info) => {
    const userIndex = db.users.findIndex(user => user.id === args.id);

    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    const deletedUser = db.users.splice(userIndex, 1);
    db.posts = db.posts.filter((post) => {
      const match = post.id === args.id;

      if (match) {
        db.comments = db.comments.filter(comment => comment.post === post.id);
      }

      return !match;
    });
    db.comments = db.comments.filter(comment => comment.author !== args.id );

    return deletedUser[0];
  },
  updateUser: (parent, args, { db }, info) => {
    const { id, data } = args;
    const user = db.users.find(user => user.id === id);

    if (!user) {
      throw new Error('User not found.');
    }

    if (typeof data.email === 'string') {
      const emailTaken = db.users.some(user => user.email === data.email);

      if (emailTaken) {
        throw new Error('Email already taken.');
      }

      user.email = data.email;
    }

    if (typeof data.name === 'string') {
      user.name = data.name;
    }

    if (typeof data.age !== 'undefined') {
      user.age = data.age;
    }

    return user;

  },
  createPost: (parent, args, { db, pubsub }, info) => {
    const userExists = db.users.some(user => user.id === args.data.author);

    if (!userExists) throw new Error('User not found.');

    const post = {
      ...args.data,
      id: uuidv4()
    }

    db.posts.push(post);

    if (post.published) {
      pubsub.publish('POST', { 
        post: {
          mutation: 'CREATED',
          data: post
        }
      });
    }

    return post;
  },
  deletePost: (parent, args, { db, pubsub }, info) => {
    const postIndex = db.posts.findIndex(post => post.id === args.id);
    
    if (postIndex === -1) {
      throw new Error('Post not found.');
    }

    const [deletedPost] = db.posts.splice(postIndex, 1);

    if (deletedPost.published) {
      pubsub.publishs('POST', {
        post: {
          mutation: 'DELETED',
          data: deletedPost
        }
      })
    }

    db.comments = db.comments.filter(comment => comment.post !== args.id);

    return deletedPost;
  },
  updatePost: (parent, args, { db, pubsub }, info) => {
    const { id, data } = args;
    const post = db.posts.find(post => post.id === id);
    const originalPost = { ...post };

    if (!post) {
      throw new Error('Post not found.');
    }

    if (typeof data.title === 'string') {
      post.title = data.title;
    }

    if (typeof data.body === 'string') {
      post.body = data.body;
    }

    if (typeof data.published === 'boolean') {
      post.published = data.published;

      if (originalPost.published && !post.published) {
        // deleted
        pubsub.publish('POST', {
          post: {
            mutation: 'DELETED',
            data: originalPost
          }
        });
      } else if (!originalPost.published && post.published) {
        // created
        pubsub.publish('POST', {
          post: {
            mutation: 'UPDATED',
            data: post
          }
        });
      }
    } else if (post.published) {
      // updated
      pubsub.publish('POST', {
        post: {
          mutation: 'UPDATED',
          data: post
        }
      })
    }

    return post;
  }, 
  createComment: (parent, { data }, { db, pubsub }, info) => {
    const userExists = db.users.some(user => user.id === data.author);
    const isPublished = db.posts.some(post => post.id === data.post && post.published);

    if (!userExists || !isPublished) {
      throw new Error('User or Post not found.');
    } 

    const comment = {
      ...data,
      id: uuidv4()
    }

    db.comments.push(comment);
    pubsub.publish(`COMMENT ${data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment
      }
    });

    return comment;
  },
  deleteComment: (parent, { id }, { db, pubsub }, info) => {
    const commentIndex = db.comments.findIndex(comment => comment.id === id);

    if (commentIndex === -1) {
      throw new Error('Comment not found.');
    }

    const [deletedComment] = db.comments.splice(commentIndex, 1);
    
    pubsub.publish(`COMMENT ${deletedComment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment
      }
    });

    return deletedComment;
  },
  updateComment: (parent, args, { db, pubsub }, info) => {
    const { id, data } = args;
    const comment = db.comments.find(comment => comment.id === id);

    if (!comment) {
      throw new Error('Comment not found.');
    }

    if (typeof data.text === 'string') {
      comment.text = data.text;

      pubsub.publish(`COMMENT ${comment.post}`, {
        comment: {
          mutation: 'UPDATED',
          data: comment
        }
      });
    }

    return comment;
  }
};

export default Mutation;
