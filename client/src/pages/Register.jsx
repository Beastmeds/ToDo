import React, { useState } from 'react'
import axios from 'axios'

export default function Register({ onAuth, apiBase }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)

  const submit = async (e)=>{
    e.preventDefault()
    try{
      const { data } = await axios.post(apiBase + '/auth/register', { username, password })
      onAuth(data.token, data.user)
    }catch(e){ setErr(e.response?.data?.error || 'Fehler') }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <h3>Register</h3>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Benutzername" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Passwort" />
      <button type="submit">Registrieren</button>
      {err && <div className="error">{err}</div>}
    </form>
  )
}
