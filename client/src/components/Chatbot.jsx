import React, { useState } from 'react'
import { createApi } from '../api'

export default function Chatbot({ token }){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [persona, setPersona] = useState(localStorage.getItem('chat_persona') || 'A')
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
      const resp = await api.post('/chat', { message: text, persona })
      setMessages(prev => [...prev, { role: 'assistant', content: resp.data.reply }])
    }catch(e){
      // Distinguish server-side errors from network/unreachable backend
      if(e.response && e.response.data){
        const reply = e.response.data.reply || e.response.data.error || 'Fehler beim Chatten'
        setMessages(prev => [...prev, { role: 'assistant', content: `Server: ${reply}` }])
      } else {
        const reply = `Server nicht erreichbar. Offline-Fallback: Echo: ${text}`
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      }
    }finally{ setLoading(false) }
    // scroll to bottom after response
    setTimeout(()=>{ containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }) }, 50)
  }

  return (
    <div className="chat card">
      <div className="messages" ref={containerRef} style={{maxHeight:320, overflow:'auto'}}>
        {messages.map((m,i)=> <div key={i} className={m.role} style={{margin:'8px 0', padding:10, borderRadius:8, background: m.role==='assistant' ? '#eef2ff' : '#f3f4f6' }}>{m.content}</div>)}
      </div>
      <div style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
        <label style={{fontSize:13, color:'#6b7280'}}>Persona:</label>
        <select value={persona} onChange={e=>{ setPersona(e.target.value); localStorage.setItem('chat_persona', e.target.value) }} style={{padding:8, borderRadius:8}}>
          <option value="A">Bot A — Hilfsbereit (ausführlich)</option>
          <option value="B">Bot B — Kurz & direkt</option>
        </select>
      </div>
      <div className="chat-input" style={{marginTop:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Frag die KI..." />
        <button className="btn-primary" onClick={send} disabled={loading}>{loading? '...' : 'Senden'}</button>
      </div>
    </div>
  )
}
