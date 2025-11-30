import React, { useState } from 'react'
import axios from 'axios'

export default function Chatbot({ apiBase, token }){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  const send = async ()=>{
    if(!text) return
    const m = { role: 'user', content: text }
    setMessages([...messages, m])
    setText('')
    try{
      const resp = await axios.post(apiBase + '/chat', { message: text }, { headers: { Authorization: `Bearer ${token}` } })
      setMessages(prev => [...prev, { role: 'assistant', content: resp.data.reply }])
    }catch(e){ setMessages(prev => [...prev, { role: 'assistant', content: 'Fehler beim Chatten' }]) }
  }

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((m,i)=> <div key={i} className={m.role}>{m.content}</div>)}
      </div>
      <div className="chat-input">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Frag die KI..." />
        <button onClick={send}>Senden</button>
      </div>
    </div>
  )
}
