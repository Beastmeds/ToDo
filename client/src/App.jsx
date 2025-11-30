import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import TodoList from './components/TodoList'
import Chatbot from './components/Chatbot'

const API = 'http://localhost:4000/api'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [view, setView] = useState('todos')

  useEffect(()=>{
    if(token) localStorage.setItem('token', token); else localStorage.removeItem('token')
    if(user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user')
  }, [token, user])

  if(!token) return (
    <div className="auth">
      <h1>ToDo mit KI</h1>
      <div className="auth-forms">
        <Login onAuth={(t,u)=>{setToken(t); setUser(u)}} apiBase={API} />
        <Register onAuth={(t,u)=>{setToken(t); setUser(u)}} apiBase={API} />
      </div>
    </div>
  )

  return (
    <div className="app">
      <header>
        <h2>ToDo</h2>
        <div>
          <button onClick={()=>setView('todos')}>Aufgaben</button>
          <button onClick={()=>setView('chat')}>KI-Chat</button>
          <button onClick={()=>{setToken(null); setUser(null)}}>Logout</button>
        </div>
      </header>
      <main>
        {view === 'todos' ? <TodoList apiBase={API} token={token} /> : <Chatbot apiBase={API} token={token} />}
      </main>
    </div>
  )
}
