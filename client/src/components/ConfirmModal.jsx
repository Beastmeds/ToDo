import React from 'react'

export default function ConfirmModal({ title='Bestätigen', message, onCancel, onConfirm }){
  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <h3>{title}</h3>
        <div style={{marginTop:10}}>{message}</div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:16}}>
          <button className="btn-ghost" onClick={onCancel}>Abbrechen</button>
          <button className="btn-danger" onClick={onConfirm}>Löschen</button>
        </div>
      </div>
    </div>
  )
}
