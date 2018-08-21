'use strict'

export const errorMessage = (error) => {
  let message = error.message
  if (error.response && error.response.data && error.response.data.message) {
    message = error.response.data.message
  }

  return message
}

export const withErrorHint = (error) => {
  error.hint = errorMessage(error)
  return error
}
