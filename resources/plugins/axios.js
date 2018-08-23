'use strict'

import axios from 'axios'

const isDebugHttp = process.env.NODE_ENV !== 'production'

// https://github.com/axios/axios
const instance = axios.create({
  // baseURL: '',
  timeout: 3000,
  // headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
});

instance.interceptors.request.use((request) => {
  return request
}, (error) => {
  return Promise.reject(error)
})

instance.interceptors.response.use((response) => {
  const request = response.config
  if (isDebugHttp) {
    console.log(
      '>>>', request.method.toUpperCase(), request.url, request.params,
      '\n   ', response.status, response.data || ''
    )
  }
  return response
}, (error) => {
  if (isDebugHttp) {
    // let {response, response: {status, data: {message}}} = error
    let {response = {}, config: request} = error
    if (request) {
      console.log(
        '>>>', request.method.toUpperCase(), request.url, request.params,
        '\n   ', response.status, response.data || ''
      )
    }
  }

  return Promise.reject(error)
})

export {axios}
export default instance
