import React, { useState } from 'react'
import { createApi } from '../api'

export default function Chatbot({ token }){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const containerRef = React.useRef(null)

  React.useEffect(()=>{
    // initial assistant hint
    setMessages([{ role: 'assistant', content: 'Hallo! Ich bin dein Assistent. Frage mich nach Ideen für Aufgaben, Prioritäten oder Hilfe.' }])
  }, [])

  const send = async ()=>{
    if(!text) return
    const m = { role: 'user', content: text }
    setMessages(prev => [...prev, m])
    setText('')
    setLoading(true)
    try{
      const api = createApi(token)
      const resp = await api.post('/chat', { message: text })
      setMessages(prev => [...prev, { role: 'assistant', content: resp.data.reply }])
    }catch(e){
      // offline fallback echo
      const reply = e.response?.data?.error ? ('Fehler beim Chatten: ' + e.response.data.error) : (`Echo: ${text}`)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    }finally{ setLoading(false) }
    // scroll to bottom after response
    setTimeout(()=>{ containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }) }, 50)
  }

  return (
    <div className="chat card">
      <div className="messages" ref={containerRef} style={{maxHeight:320, overflow:'auto'}}>
        {messages.map((m,i)=> <div key={i} className={m.role} style={{margin:'8px 0', padding:10, borderRadius:8, background: m.role==='assistant' ? '#eef2ff' : '#f3f4f6' }}>{m.content}</div>)}
      </div>
      <div className="chat-input">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Frag die KI..." />
        <button className="btn-primary" onClick={send} disabled={loading}>{loading? '...' : 'Senden'}</button>
      </div>
    </div>
  )
}
