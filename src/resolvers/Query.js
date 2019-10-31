const Query = {
  users: (parent, args, { db }, info) => {
    if (!args.query) {
      return db.users;
    }
    return db.users.filter((user) => {
      return user.name.toLocaleLowerCase().includes(args.query.toLocaleLowerCase);
    });
  },
  posts: (parent, args, { db }, info) => {
    if (!args.query) return db.posts;

    return db.posts.filter((post) => {
      const titleMatch = post.title.toLowercase().includes(args.query.toLocaleLowerCase());
      const bodyMatch = post.body.toLowercase().includes(args.query.toLocaleLowerCase());
      return titleMatch || bodyMatch;
    });
  },
  comments: (parent, args, { db }, info) => {
    return db.comments;
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
};

export default Query;
