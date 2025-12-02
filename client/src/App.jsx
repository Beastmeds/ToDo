import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import TodoList from './components/TodoList'
import Chatbot from './components/Chatbot'
import OwnerPanel from './components/OwnerPanel'
import AuthModal from './components/AuthModal'
import ProfileModal from './components/ProfileModal'

const API = 'http://localhost:4000/api'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [view, setView] = useState('todos')
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')

  useEffect(()=>{
    if(token) localStorage.setItem('token', token); else localStorage.removeItem('token')
    if(user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user')
    if(dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [token, user, dark])

  if(!token) return (
    <div className="container">
      <div className="hero card">
        <div className="left">
          <h1>ToDo mit KI — Organisiere deinen Tag smarter</h1>
          <p>Erstelle Aufgaben, sprich mit der eingebauten KI für Vorschläge und verwalte alles in einer schlanken App.</p>
          <div style={{marginTop:12}}>
            <button className="btn-primary" onClick={()=>setShowAuth(true)}>Login / Registrieren</button>
            <button className="btn-ghost" style={{marginLeft:8}} onClick={()=>window.open('https://github.com','_blank')}>Mehr Infos</button>
          </div>
        </div>
        <div style={{width:320}}>
          <div style={{textAlign:'center'}}>
            <img src="/logo192.png" alt="logo" style={{width:120, height:120, borderRadius:18, boxShadow:'0 8px 20px rgba(37,99,235,0.12)'}} />
          </div>
        </div>
      </div>
      <div className="center small-muted" style={{marginTop:12}}>Klicke auf "Login / Registrieren", um fortzufahren. Wenn die Verbindung ausfällt, funktioniert die App auch lokal.</div>
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onAuth={(t,u)=>{ setToken(t); setUser(u) }} />}
    </div>
  )

  return (
    <div className="container">
      <div className="app card">
        <header style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <h2 style={{margin:0}}>ToDo</h2>
            <div className="small-muted">{user?.username ? `Angemeldet als ${user.username}` : ''}</div>
          </div>
          <div className="header-actions">
            <button onClick={()=>setView('todos')}>Aufgaben</button>
            <button onClick={()=>setView('chat')}>KI-Chat</button>
            {user?.role === 'owner' && <button onClick={()=>setView('owner')}>Owner Panel</button>}
            <button onClick={()=>setShowProfile(true)}>Profil</button>
            <button onClick={()=>setDark(d=>!d)}>{dark? 'Light' : 'Dark'}</button>
            <button onClick={()=>{setToken(null); setUser(null)}}>Logout</button>
          </div>
        </header>
        <main style={{marginTop:16}}>
          {view === 'todos' && <TodoList token={token} />}
          {view === 'chat' && <Chatbot token={token} />}
          {view === 'owner' && user?.role === 'owner' && <div style={{padding:10}}><h3>Owner Bereich</h3><OwnerPanel token={token} /></div>}
        </main>
      </div>
      {showProfile && <ProfileModal onClose={()=>setShowProfile(false)} onUpdate={(u)=>setUser(u)} />}
    </div>
  )
}
