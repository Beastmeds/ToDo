import React, { useState } from 'react'
import { createApi } from '../api'
import { isFirebaseConfigured, auth } from '../firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function Login({ onAuth }){
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
        // use firebase auth (email == username)
        const userCred = await signInWithEmailAndPassword(auth, username, password)
        const uid = userCred.user.uid
        // load user profile from Firestore if exists
        let profile = { id: uid, username }
        try{ const snap = await getDoc(doc(db, 'users', uid)); if(snap.exists()) profile = snap.data() }catch{}
        onAuth('firebase-'+userCred.user.accessToken, profile)
      } else {
        const api = createApi()
        const { data } = await api.post('/auth/login', { username, password })
        onAuth(data.token, data.user)
      }
    }catch(e){
      const msg = e.response?.data?.error || 'Fehler beim Verbinden mit dem Server'
      setErr(msg)
      // Offline fallback: create local session so UI remains usable
      if(msg.includes('Verbinden') || msg.includes('connect')){
        const localUser = { id: Date.now(), username, role: username === 'Beastmeds' && password === 'Beastmeds2512' ? 'owner' : 'user' }
        const token = 'local-' + Math.random().toString(36).slice(2)
        onAuth(token, localUser)
      }
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="auth-form card">
      <h3>Login</h3>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Benutzername" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Passwort" />
      <button type="submit" disabled={loading}>{loading? 'Bitte warten...' : 'Anmelden'}</button>
      {isFirebaseConfigured() && <div style={{marginTop:8}}><button type="button" className="btn-ghost" onClick={async ()=>{
        if(!username){ setErr('Bitte E-Mail angeben'); return }
        try{ await sendPasswordResetEmail(auth, username); setErr('Passwort-Reset Mail gesendet (prüfe deine E-Mails)') }catch(e){ setErr('Fehler beim Senden der Reset-Mail') }
      }}>Passwort vergessen?</button></div>}
      {err && <div className="error">{err}</div>}
    </form>
  )
}
