import React, { useState, useEffect } from 'react'
import { createApi } from '../api'
import { isFirebaseConfigured, db } from '../firebase'
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'

export default function TodoList({ token }){
  // prefer a per-request working base (App detects working base and may pass it via global),
  // fallback to createApi(token) which uses ENV_BASE or localhost.
  const api = createApi(token)
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [offline, setOffline] = useState(false)

  const localKey = 'local_todos_v1'

  const loadLocal = ()=>{
    const raw = localStorage.getItem(localKey)
    if(!raw) return []
    try{ return JSON.parse(raw) }catch{ return [] }
  }

  const saveLocal = (list)=> localStorage.setItem(localKey, JSON.stringify(list))

  const load = async ()=>{
    if(isFirebaseConfigured()){
      // realtime listener for user's todos
      try{
        const uid = token?.startsWith('firebase-') ? (token.split('-')[1] || null) : null
        // better: if token not helpful, use current user from auth (not available here). We'll query by owner field in docs if present.
        const q = query(collection(db, 'todos'), where('owner', '==', userIdForQuery()))
        const unsub = onSnapshot(q, snap => {
          const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          setTodos(arr)
        })
        setOffline(false)
        // store unsubscribe to cleanup - not implemented for simplicity
      }catch(e){ setTodos(loadLocal()); setOffline(true) }
    } else {
      try{
        const { data } = await api.get('/todos')
        setTodos(data)
        setOffline(false)
      }catch(e){ setTodos(loadLocal()); setOffline(true) }
    }
  }

  useEffect(()=>{ load() }, [])

  const add = async ()=>{
    if(!text) return
    if(isFirebaseConfigured()){
      try{
        await addDoc(collection(db, 'todos'), { owner: getCurrentUid(), title: text, done: 0, created_at: Date.now() })
        setText('')
        setOffline(false)
      }catch(e){
        const item = { id: Date.now(), user_id: null, title: text, done: 0 }
        const next = [item, ...todos]
        setTodos(next); setText('')
        saveLocal(next); setOffline(true)
      }
    } else {
      try{
        const { data } = await api.post('/todos', { title: text })
        setTodos([data, ...todos]); setText('')
        setOffline(false)
      }catch(e){
        const item = { id: Date.now(), user_id: null, title: text, done: 0 }
        const next = [item, ...todos]
        setTodos(next); setText('')
        saveLocal(next); setOffline(true)
      }
    }
  }

  const toggle = async (t)=>{
    if(isFirebaseConfigured()){
      try{
        await updateDoc(doc(db, 'todos', t.id), { done: t.done ? 0 : 1 })
      }catch(e){ const next = todos.map(x => x.id === t.id ? { ...x, done: x.done?0:1 } : x); setTodos(next); saveLocal(next); setOffline(true) }
    } else {
      try{ await api.put(`/todos/${t.id}`, { done: t.done ? 0 : 1 }); load() }
      catch(e){ const next = todos.map(x => x.id === t.id ? { ...x, done: x.done?0:1 } : x); setTodos(next); saveLocal(next); setOffline(true) }
    }
  }

  const remove = async (t)=>{
    if(isFirebaseConfigured()){
      try{ await deleteDoc(doc(db, 'todos', t.id)) }catch(e){ const next = todos.filter(x=>x.id!==t.id); setTodos(next); saveLocal(next); setOffline(true) }
    } else {
      try{ await api.delete(`/todos/${t.id}`); load() }
      catch(e){ const next = todos.filter(x=>x.id!==t.id); setTodos(next); saveLocal(next); setOffline(true) }
    }
  }

  function getCurrentUid(){
    try{ const userStr = localStorage.getItem('user'); if(userStr) return JSON.parse(userStr).id }catch{}
    return null
  }

  function userIdForQuery(){
    const uid = getCurrentUid()
    return uid || null
  }

  return (
    <div className="todo">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div className="todo-add">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Neue Aufgabe" />
          <button className="btn-primary" onClick={add}>Hinzufügen</button>
        </div>
        <div className="small-muted">{offline? 'Offline-Modus (lokal)': 'Online'}</div>
      </div>
      <ul>
        {todos.map(t=> (
          <li key={t.id} className={t.done? 'done':''}>
            <span onClick={()=>toggle(t)} style={{cursor:'pointer'}}>{t.title}</span>
            <div className="actions">
              <button className="btn-ok" onClick={()=>toggle(t)}>{t.done? 'Öffnen' : 'Erledigt'}</button>
              <button className="btn-danger" onClick={()=>remove(t)}>Löschen</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
