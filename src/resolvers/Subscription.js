const Subscription = {
  comment: {
    subscribe: (parent, { postId }, { pubsub, db }, info) => {
      const post = db.posts.find(post => post.id === postId && post.published);


    }
  }
};

export default Subscription;
