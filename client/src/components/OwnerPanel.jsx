import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function OwnerPanel({ token }){
  const [users, setUsers] = useState([])
  const [todos, setTodos] = useState([])

  useEffect(()=>{
    // Try Firebase first if configured
    import('../firebase').then(({ isFirebaseConfigured, db })=>{
      if(isFirebaseConfigured()){
        const { collection, getDocs } = require('firebase/firestore')
        getDocs(collection(db, 'users')).then(snap => setUsers(snap.docs.map(d=>d.data()))).catch(()=>{})
        getDocs(collection(db, 'todos')).then(snap => setTodos(snap.docs.map(d=>({ id: d.id, ...d.data() })))).catch(()=>{})
      } else {
        const headers = { Authorization: `Bearer ${token}` }
        axios.get('http://localhost:4000/api/admin/users', { headers }).then(r=>setUsers(r.data)).catch(()=>{})
        axios.get('http://localhost:4000/api/admin/todos', { headers }).then(r=>setTodos(r.data)).catch(()=>{})
      }
    })
  }, [token])

  return (
    <div className="owner-panel">
      <h4>Benutzer</h4>
      <ul>
        {users.map(u=> <li key={u.id}>{u.username} - {u.role}</li>)}
      </ul>
      <h4>Alle ToDos</h4>
      <ul>
        {todos.map(t=> <li key={t.id}>#{t.id} ({t.user_id}) {t.title} - {t.done? 'done':'open'}</li>)}
      </ul>
    </div>
  )
}
