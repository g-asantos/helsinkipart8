
import React, { useState, useEffect } from 'react'
import { ALL_AUTHORS, ALL_BOOKS, USER, ALL_BOOKS_BY_GENRE, BOOK_ADDED } from './queries'
import { useQuery, useApolloClient, useSubscription } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Recommended from './components/Recommended'
import LoginForm from './components/LoginForm'


const App = () => {
  const client = useApolloClient()
  const [page, setPage] = useState('authors')
  const [filtered, setFiltered] = useState(null)
  const [token, setToken] = useState(null)

  const authors = useQuery(ALL_AUTHORS, {
    pollInterval: 2000
  })
  const books = useQuery(ALL_BOOKS, {
    pollInterval: 2000
  })



  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  useEffect(() => {
    const checktoken = localStorage.getItem('user-token')
    if (checktoken !== null) {
      setToken(checktoken)
    }
  }, [])

  useEffect(() => {
    if (token) {
      const findUserAndFilterGenre = async () => {
        const { data } = await client.query({
          query: USER,
        })
        
        const result = await client.query({
          query: ALL_BOOKS_BY_GENRE,
          variables: { genres: data.me.favoriteGenre }
        })
        setFiltered(result)

        
      }
      
    findUserAndFilterGenre()

    }
    
  }   
 , [client, token ])

 const updateCacheWith = (addedBook) => {
  const includedIn = (set, object) => 
    set.map(p => p.id).includes(object.id)  

  const dataInStore = client.readQuery({ query: ALL_BOOKS })
  if (!includedIn(dataInStore.allBooks, addedBook)) {
    client.writeQuery({
      query: ALL_BOOKS,
      data: { allBooks : dataInStore.allBooks.concat(addedBook) }
    })
  }   
}


  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({subscriptionData}) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`${addedBook.title} added!`)
      updateCacheWith(addedBook)
    }
  })




if (token === null) {
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('login')}>login</button>
      </div>

      <Authors
        show={page === 'authors'}
        authors={authors}
      />

      <Books
        show={page === 'books'}
        books={books}
      />


      <LoginForm
        setToken={setToken}
        show={page === 'login'}
        setPage={(page) => setPage(page)}
      />

    </div>
  )
}



return (
  <div>
    <div>
      <button onClick={() => setPage('authors')}>authors</button>
      <button onClick={() => setPage('books')}>books</button>
      <button onClick={() => setPage('add')}>add book</button>
      <button onClick={() => setPage('recommended')}>recommended</button>
      <button onClick={logout}>logout</button>
    </div>

    <Authors
      show={page === 'authors'}
      authors={authors}
    />

    <Books
      show={page === 'books'}
      books={books}
    />

    <NewBook
      show={page === 'add'}
    />

    <Recommended
      show={page === 'recommended'}
      filtered={filtered} />



  </div>
)
}

export default App