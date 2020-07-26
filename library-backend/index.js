const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
mongoose.set('useFindAndModify', false)

const MONGODB_URI = 'mongodb+srv://fullstack:1111@cluster0-tqvpe.mongodb.net/bookList?retryWrites=true&w=majority'
mongoose.set('useCreateIndex', true)

console.log('connecting to', MONGODB_URI)


mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })


const JWT_SECRET = '1111'

const typeDefs = gql`
    
type Author {
    name: String
    born: Int
    bookCount: Int
    id: ID!
}


type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }  

    
    type Query {
      bookCount: Int!
      authorCount: Int!
      allBooks(author: String, genres: String): [Book!]!
      allAuthors: [Author!]!
      me: User
  }


  
  type Mutation {
    addBook(
        title: String!
        published: String!
        author: String!
        genres: [String!]
    ): Book
    editAuthor(
        name: String!
        setBornTo: String!
    ): Author
    createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
  }  
  
  type Subscription {
      bookAdded: Book!
  }
`

const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {

            if (!args.author && !args.genres) {
                const books = await Book.find({}).populate('author', { id: 1, born: 1, name: 1 })
                return books
            } else if (args.author && !args.genres) {
                const books = await Book.find({}).populate('author', { id: 1, born: 1, name: 1 })
                return books.filter(b => b.author == args.author)
            } else if (!args.author && args.genres) {
                const books = await Book.find({genres: { $in: [args.genres]}}).populate('author', { id: 1, born: 1, name: 1 })
                return books
                
            }

            const books = await Book.find({}).populate('author', { id: 1, born: 1, name: 1 })
            return books.filter(b => b.genres == args.genres && b.author === args.author)


        },
        allAuthors: async () => {
            const authors = await Author.find({})
            return authors
        },
        me: async (root, args, context) => {
            return context.currentUser
        }
    },
    Mutation: {
        addBook: async (root, args, context) => {

            const author = await Author.findOne({ name: args.author })
            const currentUser = context.currentUser

            if (!currentUser) {
                throw new AuthenticationError('not authenticated')
            }




            if (!author) {


                try {
                    const newAuthor = new Author({ name: args.author })
                    await newAuthor.save()
                    const book = new Book({ ...args, author: newAuthor.id })
                    await book.save()
                    pubsub.publish('BOOK_ADDED', { bookAdded: book})

                    return book
                } catch (error) {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                }
            }

            const book = new Book({ ...args, author: author })

            try {
                await book.save()
                pubsub.publish('BOOK_ADDED', { bookAdded: book})
                return book
            } catch (err) {
                throw new UserInputError(err.message, {
                    invalidArgs: args
                })
            }



        },
        editAuthor: async (root, args, context) => {

            const currentUser = context.currentUser

            if (!currentUser) {
                throw new AuthenticationError('not authenticated')
            }

            const author = await Author.findOne({ name: args.name })
            author.born = args.setBornTo
            return author.save()
        },
        createUser: async (root, args) => {
            const user = new User({ username: args.username })

            return user.save()
                .catch(err => {
                    throw new UserInputError(error.message, {
                        invalidArgs: args
                    })
                })
        },
        login: async (root, args) => {
            const user = await User.find({ username: args.username })

            if (!user || args.password != '1111') {
                throw new UserInputError('wrong credentials')
            }

            const userForToken = {
                username: user[0].username,
                favoriteGenre: user[0].favoriteGenre,
                id: user[0]._id
            }

            return { value: jwt.sign(userForToken, JWT_SECRET) }
        }

    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        }
    },
    Book: {
        title: (root) => root.title,
        published: (root) => root.published,
        author: (root) => {
            return {
                name: root.author.name,
                born: root.author.born,
                id: root.author.id
            }
        },
        genres: (root) => root.genres
    },
    Author: {
        name: (root) => root.name,
        born: (root) => root.born,
        bookCount: async (root) => {

            const books = await Book.find({}).populate('author', { name: 1 })
            const Count = books.filter(b => b.author.name === root.name)
            return Count.length
        }

    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {

        const auth = req ? req.headers.authorization : null
 
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            
            const decodedToken =  jwt.verify(
                auth.substring(7), JWT_SECRET
            )

            const id = await decodedToken.id
            
            const currentUser = await User.findById(id)
                
            return { currentUser }
        }
    }
})

server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`Server ready at ${url}`)
    console.log(`Subscriptions ready at ${subscriptionsUrl}`)
  })