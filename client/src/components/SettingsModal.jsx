import React, { useState } from 'react'

const BACKGROUNDS = [
  { id: '', name: 'Default' },
  { id: 'bg-gradient-1', name: 'Purpur-Gradient' },
  { id: 'bg-wave', name: 'Wellen' },
  { id: 'bg-abstract', name: 'Abstrakt' }
]

export default function SettingsModal({ settings = {}, onClose, onSave }){
  const [bg, setBg] = useState(settings.background || '')
  const [theme, setTheme] = useState(settings.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))
  const [filePreview, setFilePreview] = useState(settings.backgroundImage || '')
  const [file, setFile] = useState(null)

  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <h3>Einstellungen</h3>
        <div style={{marginTop:12}}>
          <label style={{display:'block', marginBottom:8}}>Hintergrund auswählen</label>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {BACKGROUNDS.map(b => (
              <button key={b.id} className={`btn-ghost ${bg===b.id? 'active':''}`} onClick={()=>setBg(b.id)} style={{minWidth:120}}>{b.name}</button>
            ))}
          </div>

          <div style={{marginTop:10}}>
            <label style={{display:'block', marginBottom:6}}>Oder eigenes Bild hochladen</label>
            <input type="file" accept="image/*" onChange={e=>{
              const f = e.target.files && e.target.files[0]
              if(!f) return
              setFile(f)
              const reader = new FileReader()
              reader.onload = ev => setFilePreview(ev.target.result)
              reader.readAsDataURL(f)
            }} />
            {filePreview && (
              <div style={{marginTop:8}}>
                <div style={{width:180, height:100, backgroundSize:'cover', backgroundPosition:'center', borderRadius:8, backgroundImage:`url(${filePreview})`}} />
                <div style={{marginTop:6}}>
                  <button className={`btn-ghost ${filePreview? 'active':''}`} onClick={()=>{ setBg(''); }}>Use this image</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{marginTop:14}}>
          <label style={{display:'block', marginBottom:8}}>Theme</label>
          <select value={theme} onChange={e=>setTheme(e.target.value)} style={{padding:8, borderRadius:8}}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:16}}>
          <button className="btn-ghost" onClick={onClose}>Abbrechen</button>
          <button className="btn-primary" onClick={()=> {
            const result = { background: bg, theme }
            if(filePreview) result.backgroundImage = filePreview
            onSave(result)
          }}>Speichern</button>
        </div>
      </div>
    </div>
  )
}
