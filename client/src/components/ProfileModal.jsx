import React, { useState, useEffect } from 'react'
import { isFirebaseConfigured, auth, db, storage } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function ProfileModal({ onClose, onUpdate }){
  const [username, setUsername] = useState('')
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    // load from localStorage or firestore
    const u = localStorage.getItem('user')
    if(u){ const parsed = JSON.parse(u); setUsername(parsed.username || '') ; setPreview(parsed.profileImage || null) }
    if(isFirebaseConfigured()){ // try to load from Firestore
      try{ const uid = JSON.parse(localStorage.getItem('user') || '{}').id; if(uid){ getDoc(doc(db,'users', uid)).then(snap=>{ if(snap.exists()){ const d = snap.data(); setUsername(d.username||''); if(d.profileImage) setPreview(d.profileImage) } }) } }catch{}
    }
  }, [])

  const onFile = async (e)=>{
    const f = e.target.files[0]; if(!f) return
    const reader = new FileReader();
    reader.onload = ()=> setPreview(reader.result)
    reader.readAsDataURL(f)
    // store file in state for upload
    e.target._file = f
  }

  const save = async ()=>{
    setLoading(true)
    try{
      if(isFirebaseConfigured()){
        const uid = JSON.parse(localStorage.getItem('user') || '{}').id
        let imageUrl = preview
        const input = document.querySelector('#profile-file')
        const f = input? input._file : null
        if(f && uid){
          const storageRef = ref(storage, `profiles/${uid}/${Date.now()}_${f.name}`)
          await uploadBytes(storageRef, f)
          imageUrl = await getDownloadURL(storageRef)
        }
        if(uid){ await setDoc(doc(db,'users', uid), { username, profileImage: imageUrl }, { merge:true }) }
        // update localStorage
        const user = JSON.parse(localStorage.getItem('user')||'{}')
        user.username = username; user.profileImage = imageUrl; localStorage.setItem('user', JSON.stringify(user))
        onUpdate(user)
      } else {
        // localStorage fallback: save preview data URL
        const user = JSON.parse(localStorage.getItem('user')||'{}')
        user.username = username; user.profileImage = preview; localStorage.setItem('user', JSON.stringify(user))
        onUpdate(user)
      }
      onClose()
    }catch(e){ console.error(e); alert('Fehler beim Speichern') }
    finally{ setLoading(false) }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={e=>e.stopPropagation()}>
        <h3>Profil bearbeiten</h3>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <div style={{width:96,height:96,borderRadius:18, overflow:'hidden', background:'#f3f4f6'}}>
            {preview ? <img src={preview} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <div style={{padding:18}} className="small-muted">Kein Bild</div>}
          </div>
          <div style={{flex:1}}>
            <input id="profile-file" type="file" accept="image/*" onChange={onFile} />
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Anzeigename" style={{width:'100%', marginTop:8, padding:8, borderRadius:8, border:'1px solid #e6e9ee'}} />
          </div>
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
          <button className="btn-ghost" onClick={onClose}>Abbrechen</button>
          <button className="btn-primary" onClick={save} disabled={loading}>{loading? 'Speichern...' : 'Speichern'}</button>
        </div>
      </div>
    </div>
  )
}
