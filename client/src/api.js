import axios from 'axios'

const ENV_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : null

// Build a prioritized list of candidate API bases.
function candidateBases(){
  const bases = []
  if(ENV_BASE) bases.push(ENV_BASE)
  // when hosted (not localhost) try relative /api first (works if backend is deployed under same domain)
  if(typeof window !== 'undefined'){
    const host = window.location.hostname
    if(host && host !== 'localhost' && host !== '127.0.0.1') bases.push('/api')
  }
  // local development fallbacks
  bases.push('http://localhost:4000/api')
  bases.push('http://192.168.178.53:4000/api')
  return bases
}

export async function findWorkingBase(timeout = 1500){
  const bases = candidateBases()
  for(const b of bases){
    try{
      const url = (b.endsWith('/api') || b === '/api') ? (b + '/health').replace('//health','/health') : b + '/health'
      const controller = new AbortController()
      const id = setTimeout(()=>controller.abort(), timeout)
      const resp = await fetch(url, { signal: controller.signal })
      clearTimeout(id)
      if(resp && resp.ok) return b
    }catch(e){ /* try next */ }
  }
  return null
}

export function createApi(token, base){
  const baseURL = base || (ENV_BASE || 'http://localhost:4000/api')
  const instance = axios.create({ baseURL })
  if(token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  if(typeof window !== 'undefined') console.debug('API base used:', baseURL)
  return instance
}
