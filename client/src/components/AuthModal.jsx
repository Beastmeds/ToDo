import React, { useState } from 'react'
import Login from '../pages/Login'
import Register from '../pages/Register'

export default function AuthModal({ onClose, onAuth }){
  const [tab, setTab] = useState('login')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', gap:8}}>
            <button className={tab==='login'? 'btn-primary active':''} onClick={()=>setTab('login')}>Login</button>
            <button className={tab==='register'? 'btn-ghost active':''} onClick={()=>setTab('register')}>Register</button>
          </div>
          <button onClick={onClose} className="btn-ghost">Schließen</button>
        </div>
        <div style={{marginTop:12}}>
          {tab === 'login' ? <Login onAuth={(t,u)=>{ onAuth(t,u); onClose() }} /> : <Register onAuth={(t,u)=>{ onAuth(t,u); onClose() }} />}
        </div>
      </div>
    </div>
  )
}
