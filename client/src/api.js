import axios from 'axios'

// Use Vite env `VITE_API_BASE` if set (recommended), otherwise fall back to server LAN IP.
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : 'http://192.168.178.53:4000/api'

export function createApi(token){
  const instance = axios.create({ baseURL: API_BASE })
  if(token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  return instance
}
