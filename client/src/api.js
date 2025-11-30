import axios from 'axios'

export function createApi(token){
  const instance = axios.create({ baseURL: 'http://localhost:4000/api' })
  if(token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  return instance
}
