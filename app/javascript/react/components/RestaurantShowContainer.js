import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import RestaurantShowTile from './RestaurantShowTile'
import ReviewFormTile from './ReviewFormTile'

const RestaurantShowContainer = (props) => {
  const [restaurant, setRestaurant] = useState({})
  const [reviews, setReviews] = useState([])
  const [currentUser, setCurrentUser] = useState({})
  const [redirect, shouldRedirect] = useState(false)
  const [userVotes, setUserVotes] = useState([])

  useEffect(() => {
    let id = props.match.params.id
    fetch(`/api/v1/restaurants/${id}`)
    .then((response) => {
      if (response.ok) {
        return response
      } else {
        let errorMessage = `${response.status} (${response.statusText})`
        let error = new Error(errorMessage)
        throw(error)
      }
    })
    .then((response) => {
      return response.json()
    })
    .then((body) => {
      setCurrentUser(body["restaurant"]["scope"])
      setRestaurant(body["restaurant"])
      setReviews(body["restaurant"]["reviews"])
      setUserVotes(body["restaurant"]["votes"])
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))
  }, [])

  const addNewReview = (formPayload) => {
    let id = props.match.params.id
    fetch(`/api/v1/restaurants/${id}/reviews`, {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify(formPayload),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    })
    .then((response) => {
      if (response.ok) {
        return response
      } else {
        let errorMessage = `${response.status} (${response.statusText})`
        let error = new Error(errorMessage)
        throw(error)
      }
    })
    .then((response) => response.json())
    .then(body => {
      setReviews([
        ...reviews,
        body.review
      ])
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))
  }


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

  const checkFetchMethod = (payload) => {
    let method = {type: ""}

    if (userVotes && userVotes.length > 0) {
      userVotes.forEach((vote) => {
        if (payload.review_id === vote.review_id && payload.helpful === vote.helpful) {
          method.type = "delete"
          method.vote_id = vote.id
        } else if (payload.review_id === vote.review_id) {
          method.type = "patch"
          method.vote_id = vote.id
        }
      })
    }
    return method
  }

  const handleVote = (votePayload) => {
    let method = checkFetchMethod(votePayload)
    if (method.type === "delete") {
      fetch(`/api/v1/votes/${method.vote_id}`, {
        credentials: "same-origin",
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(votePayload)
      })
      .then((response) => response.json())
      .then((body) => {
        setUserVotes(body.votes)
        setReviews(body.reviews.reviews)
      })
    } else if (method.type === "patch") {
      fetch(`/api/v1/votes/${method.vote_id}`, {
        credentials: "same-origin",
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(votePayload)
      })
      .then((response) => response.json())
      .then((body) => {
        setUserVotes(body.votes)
        setReviews(body.reviews.reviews)
      })
    } else {
      fetch("/api/v1/votes", {
        credentials: "same-origin",
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(votePayload)
      })
      .then((response) => response.json())
      .then((body) => {
        setUserVotes([
          ...userVotes,
          body.vote
        ])
        setReviews(body.reviews.reviews)
      })
    }
  }

  return (
    <div>
      {deleteButton}
      <RestaurantShowTile
        restaurant={restaurant}
        reviews={reviews}
        currentUser={currentUser}
        addNewReview={addNewReview}
        handleVote={handleVote}
        current_user_votes={userVotes}
      />
    </div>
  )
}

export default RestaurantShowContainer
