import React, {useState} from 'react'


const Books = (props) => {

  const [filter, setFilter] = useState('')

  if (!props.show) {
    return null
  }

  if(props.books.loading){
    return <div>loading...</div>
  }
  
  if(props.books.data.allBooks.length === 0){
    return <div>no books registered</div>
  }
  
  const books = props.books.data.allBooks



  

  const genresTotal = []

  for(let i = 0; i < books.length; i++){
    
    books[i].genres.forEach(genre =>
      genresTotal.push(genre))

  }

  let genresLength = genresTotal.length
  let uniqueGenres = []

  for(let i = 0; i < genresLength; i++){
    if(uniqueGenres.indexOf(genresTotal[i]) === -1){
      uniqueGenres.push(genresTotal[i])
    }

  }

  let filteredBooks = []

  if(filter !== ''){
    genresTotal.forEach(genre => {
      if(genre === filter){
        
        for(let i = 0; i < books.length; i++){
          
          for(let g = 0; g < books[i].genres.length; g++){
            if(books[i].genres[g] === genre){
              filteredBooks.push(books[i])
            }
        
          }
          
        }
       
      }
    })
  } else {
    filteredBooks = books
  }

  let filteredLength = filteredBooks.length
  let uniqueBooks = []

  
  for(let i = 0; i < filteredLength; i++){
    if(uniqueBooks.indexOf(filteredBooks[i]) === -1){
      uniqueBooks.push(filteredBooks[i])
    }

  }

  
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {
          uniqueBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
          
          


          
          
        </tbody>
      </table>
      <div>
      {uniqueGenres.map(genre =>
          
            <button key={genre + 1 * Math.random()} onClick={() => setFilter(genre)}>{genre}</button>
         
          )}
        <button onClick={() => setFilter('')}>all genres</button>
       </div>
    </div>
  )
}

export default Books