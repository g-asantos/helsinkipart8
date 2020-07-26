import { gql } from '@apollo/client'


export const ALL_AUTHORS = gql`
    query {
        allAuthors{
            name
            born
            bookCount
        }
    }
`


const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    author{
        name
        born
    }
    published
    genres
  }
`

export const ALL_BOOKS = gql`
    query {
        allBooks{
            ...BookDetails
        }
    }
    ${BOOK_DETAILS}


`

export const ALL_BOOKS_BY_GENRE = gql`
query allBooks($genres: String!) {
    allBooks(genres: $genres){
        title
        author{
            name
            born
            id
        }
        published
        genres
    }
}




`
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const CREATE_BOOKS = gql`
    mutation addBook($title: String!, $published: String!, $author: String!, $genres: [String!]){
        addBook(
            title: $title
            published: $published
            author: $author
            genres: $genres
        ){
            ...BookDetails
        }
    }
    ${BOOK_DETAILS}
`



export const EDIT_BIRTH = gql`
    mutation editAuthor($name: String!, $setBornTo: String!){
        editAuthor(
            name: $name,
            setBornTo: $setBornTo
        ){
            name
            born
        }
    } 
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const USER = gql`
{
    me  {
      username
      favoriteGenre
    }
  }
`