import React, { useState } from 'react'
import { createApi } from '../api'
import { isFirebaseConfigured, auth, db } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'

export default function Register({ onAuth }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e)=>{
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try{
      if(isFirebaseConfigured()){
        // create firebase user (email==username)
        const userCred = await createUserWithEmailAndPassword(auth, username, password)
        const uid = userCred.user.uid
        const profile = { id: uid, username, role: 'user' }
        // store profile in Firestore
        await setDoc(doc(db, 'users', uid), profile)
        onAuth('firebase-'+userCred.user.accessToken, profile)
      } else {
        const api = createApi()
        const { data } = await api.post('/auth/register', { username, password })
        onAuth(data.token, data.user)
      }
    }catch(e){
      const msg = e.response?.data?.error || 'Fehler beim Verbinden mit dem Server'
      setErr(msg)
      // Offline fallback: create user locally
      if(msg.includes('Verbinden') || msg.includes('connect')){
        const localUser = { id: Date.now(), username, role: 'user' }
        const token = 'local-' + Math.random().toString(36).slice(2)
        onAuth(token, localUser)
      }
    }
    finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="auth-form card">
      <h3>Register</h3>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Benutzername" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Passwort" />
      <button type="submit" disabled={loading}>{loading? 'Bitte warten...' : 'Registrieren'}</button>
      {err && <div className="error">{err}</div>}
    </form>
  )
}
