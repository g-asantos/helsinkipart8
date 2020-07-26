import React from 'react'

const Recommended = ({ show, filtered }) => {




    if (!show) {
        return null
    }

    if (filtered.loading || filtered === null) {
        return <div>loading...</div>
    }

    if (filtered.data.allBooks.length === 0) {
        return <div>no books registered</div>
    }



    const books = filtered.data.allBooks






    return (
        <div>
            <h2>recommendations</h2>
            <p>books in your favorite genre <span style={{ fontWeight: 'bold' }}></span></p>
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
                        books.map(a =>
                            <tr key={a.title}>
                                <td>{a.title}</td>
                                <td>{a.author.name}</td>
                                <td>{a.published}</td>
                            </tr>
                        )}





                </tbody>
            </table>
        </div>
    )
}

export default Recommended