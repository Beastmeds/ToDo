import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ConfirmModal from './ConfirmModal'

export default function OwnerPanel({ token }){
  const [users, setUsers] = useState([])
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [showLogs, setShowLogs] = useState(false)
  const [logs, setLogs] = useState([])

  useEffect(()=>{
    // Try Firebase first if configured
    import('../firebase').then(({ isFirebaseConfigured, db })=>{
      if(isFirebaseConfigured()){
          const { collection, getDocs } = require('firebase/firestore')
          getDocs(collection(db, 'users')).then(snap => setUsers(snap.docs.map(d=>({ id: d.id, ...d.data() })))).catch(()=>{})
          getDocs(collection(db, 'todos')).then(snap => setTodos(snap.docs.map(d=>({ id: d.id, ...d.data() })))).catch(()=>{})
        } else {
        const headers = { Authorization: `Bearer ${token}` }
        axios.get('http://localhost:4000/api/admin/users', { headers }).then(r=>setUsers(r.data)).catch(()=>{})
        axios.get('http://localhost:4000/api/admin/todos', { headers }).then(r=>setTodos(r.data)).catch(()=>{})
          axios.get('http://localhost:4000/api/admin/logs', { headers }).then(r=>setLogs(r.data)).catch(()=>{})
      }
    })
  }, [token])

  return (
    <div className="owner-panel">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h4>Benutzer</h4>
        <div>
          <button className="btn-ghost" onClick={()=>{
            const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'users.json'; a.click(); URL.revokeObjectURL(url)
          }}>Exportieren</button>
          <button className="btn-ghost" style={{marginLeft:8}} onClick={()=>setShowLogs(s=>!s)}>{showLogs? 'Logs verstecken':'Logs anzeigen'}</button>
        </div>
      </div>
      <ul>
        {users.map(u=> (
          <li key={u.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>{u.username} <span className="small-muted">#{u.id}</span></div>
            <div className="owner-actions">
              <select defaultValue={u.role} onChange={e=>{ u._newRole = e.target.value }}>
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="owner">owner</option>
              </select>
              <button className="btn-ok" onClick={async ()=>{
                const newRole = u._newRole || u.role
                if(newRole === u.role) return
                setLoading(true)
                try{
                  import('../firebase').then(async ({ isFirebaseConfigured, db })=>{
                    if(isFirebaseConfigured()){
                      const { doc, updateDoc } = require('firebase/firestore')
                      await updateDoc(doc(db, 'users', String(u.id)), { role: newRole })
                      setUsers(prev => prev.map(p => p.id === u.id ? { ...p, role: newRole } : p))
                    } else {
                      await axios.put(`http://localhost:4000/api/admin/users/${u.id}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } })
                      setUsers(prev => prev.map(p => p.id === u.id ? { ...p, role: newRole } : p))
                    }
                  })
                }catch(err){ console.error(err) }
                setLoading(false)
              }}>Speichern</button>
              <button className="btn-danger" onClick={()=> setConfirm({ type: 'delete', user: u }) }>Löschen</button>
            </div>
          </li>
        ))}
      </ul>
      {confirm && (
        <ConfirmModal
          title={confirm.type === 'delete' ? 'Benutzer löschen' : 'Bestätigen'}
          message={`Benutzer ${confirm.user.username} wirklich löschen?`}
          onCancel={()=>setConfirm(null)}
          onConfirm={async ()=>{
            setConfirm(null)
            setLoading(true)
            const u = confirm.user
            try{
              import('../firebase').then(async ({ isFirebaseConfigured, db })=>{
                if(isFirebaseConfigured()){
                  const { doc, deleteDoc, collection, getDocs } = require('firebase/firestore')
                  const todoSnap = await getDocs(collection(db, 'todos'))
                  const deletes = []
                  todoSnap.forEach(d => { if(d.data().user_id === u.id || String(d.data().user_id) === String(u.id)) deletes.push(deleteDoc(doc(db, 'todos', d.id))) })
                  await Promise.all(deletes)
                  await deleteDoc(doc(db, 'users', String(u.id)))
                  setUsers(prev => prev.filter(p => p.id !== u.id))
                } else {
                  await axios.delete(`http://localhost:4000/api/admin/users/${u.id}`, { headers: { Authorization: `Bearer ${token}` } })
                  setUsers(prev => prev.filter(p => p.id !== u.id))
                }
              })
            }catch(err){ console.error(err) }
            setLoading(false)
          }}
        />
      )}

      {showLogs && (
        <div style={{marginTop:12}}>
          <h4>Audit Logs</h4>
          <div style={{maxHeight:220, overflow:'auto', border:'1px solid #eef2ff', padding:8, borderRadius:8, background:'#fbfdff'}}>
            {logs.length === 0 && <div className="small-muted">Keine Logs</div>}
            <ul style={{listStyle:'none', padding:0}}>
              {logs.map(l => (
                <li key={l.id} style={{padding:6, borderBottom:'1px solid #f1f5f9'}}>
                  <div style={{fontSize:13}}><strong>{l.action}</strong> by <span className="small-muted">#{l.actor_id}</span> → target <span className="small-muted">#{l.target_id}</span></div>
                  <div className="small-muted" style={{fontSize:12}}>{l.detail} • {new Date(l.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <h4>Alle ToDos</h4>
      <ul>
        {todos.map(t=> <li key={t.id}>#{t.id} ({t.user_id}) {t.title} - {t.done? 'done':'open'}</li>)}
      </ul>
    </div>
  )
}
