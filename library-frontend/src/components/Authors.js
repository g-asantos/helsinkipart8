
import React, { useState } from 'react'
import { EDIT_BIRTH } from '../queries'
import { useMutation } from '@apollo/client'


const Authors = (props) => {
  const [name, setName] = useState('')
  const [setBornTo, setSetBornTo] = useState('')
  const [editBirth] = useMutation(EDIT_BIRTH)

  if (!props.show) {
    return null
  }
  
  if (props.authors.loading) {
    return <div>loading...</div>
  }

  if(props.authors.data === undefined){
    return <div>no authors registered</div>
  }

  const authors = props.authors.data.allAuthors


  const submit = async (event) => {
    event.preventDefault()

    editBirth({ variables: { name, setBornTo } })

    setName('')
    setSetBornTo('')

  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <br />

      <div>
        <form onSubmit={submit}>

            <select key='authors' onChange={({ target }) => setName(target.value)}>
            {authors.map(a => 
              <option key={a.name} value={a.name}>{a.name}</option>)}

            </select>
          <div>
            born
          <input
              type='number'
              value={setBornTo}
              onChange={({ target }) => setSetBornTo(target.value)}
            />
          </div>
          <button type='submit'>update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
