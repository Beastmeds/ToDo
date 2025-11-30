import React, { useState, useEffect } from 'react'
import { createApi } from '../api'

export default function TodoList({ apiBase, token }){
  const api = createApi(token)
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')

  const load = async ()=>{
    const { data } = await api.get('/todos')
    setTodos(data)
  }

  useEffect(()=>{ load() }, [])

  const add = async ()=>{
    if(!text) return
    const { data } = await api.post('/todos', { title: text })
    setTodos([data, ...todos]); setText('')
  }

  const toggle = async (t)=>{
    await api.put(`/todos/${t.id}`, { done: t.done ? 0 : 1 })
    load()
  }

  const remove = async (t)=>{ await api.delete(`/todos/${t.id}`); load() }

  return (
    <div className="todo">
      <div className="todo-add">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Neue Aufgabe" />
        <button onClick={add}>Hinzufügen</button>
      </div>
      <ul>
        {todos.map(t=> (
          <li key={t.id} className={t.done? 'done':''}>
            <span onClick={()=>toggle(t)}>{t.title}</span>
            <button onClick={()=>remove(t)}>Löschen</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
