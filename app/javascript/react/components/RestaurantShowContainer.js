import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import RestaurantShowTile from './RestaurantShowTile'

const RestaurantShowContainer = (props) => {  
  const [restaurant, setRestaurant] = useState({})
  const [currentUser, setCurrentUser ] = useState({})
  const [ redirect, shouldRedirect ] = useState(false)

  useEffect(() => {
    let id = props.match.params.id
    fetch(`/api/v1/restaurants/${id}`)
    .then((response) => {
      if (response.ok) {
        return response
      } else {
        let errorMessage = `${response.status} (${response.statusText})`
        let error = new Error(errorMessage);
        throw(error);
      }
    })
    .then((response) => {
      return response.json()
    })
    .then((body) => {
      setCurrentUser(body[0])
      setRestaurant(body[1])
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))
  }, [])
  
  const confirmDelete = () => {
    let confirmMessage = confirm("Do you want to delete this item?")
    if (confirmMessage === true) {
      deletePost()
    }
  }
  const deletePost = () => {
    let id = props.match.params.id
    fetch(`/api/v1/restaurants/${id}`, {
      credentials: "same-origin",
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "Accept": "application/json"
      }
    })
    .then(() => {
      shouldRedirect(true)
    })
  }

  if (redirect) {
    return <Redirect to='/' />
  }

  let deleteButton
  if (currentUser) {
    if (currentUser.role === "admin") {
      deleteButton = (
        <button className="button" onClick={confirmDelete}>Delete</button>
      )
    } else {
      deleteButton = ""
    }
  }
  
  return (
    <div>
      {deleteButton}
      <RestaurantShowTile restaurant={restaurant} />
    </div>
  )
}

export default RestaurantShowContainer