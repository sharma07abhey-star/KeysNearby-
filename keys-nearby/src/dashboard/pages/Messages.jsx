// Messages.jsx — Inbox with conversation threads
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const seedConversations = [
  { id:1, name:'Arjun Mehta', vehicle:'Hyundai Creta', time:'10:42 AM', preview:'Is the car available for tomorrow?', unread:2, avatar:'AM', messages:[['them','Hi! Is the car available for tomorrow?','10:40 AM'],['me','Yes, it is available. What time would you like to pick it up?','10:41 AM'],['them','Around 9 AM would work for me.','10:42 AM']] },
  { id:2, name:'Priya Sharma', vehicle:'Honda City', time:'Yesterday', preview:'Thanks! I will pick it up at 9 AM.', unread:0, avatar:'PS', messages:[['them','Hi, can I confirm the pickup time?','Yesterday'],['me','Yes, 9 AM works perfectly.','Yesterday'],['them','Thanks! I will pick it up at 9 AM.','Yesterday']] },
  { id:3, name:'Rahul Verma', vehicle:'Tata Nexon', time:'Mon', preview:'Can we extend the booking by one day?', unread:1, avatar:'RV', messages:[['them','Can we extend the booking by one day?','Mon'],['me','Let me check the availability and get back to you.','Mon']] },
]

function initialsOf(name) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function Messages() {
  const location = useLocation()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState(seedConversations)
  const [selectedId, setSelectedId] = useState(1)
  const [draft, setDraft] = useState('')
    const [messages, setMessages] = useState(() => Object.fromEntries(seedConversations.map(c => [c.id, c.messages.map(([from, text, time]) => ({ from, text, time }))])))

  const handledKeyRef = useRef(null)

  // If we arrived here from "Message owner" on Find a Vehicle, open (or create) that owner's thread.
  useEffect(() => {
    const incoming = location.state
    if (!incoming || !incoming.ownerName) return
    if (handledKeyRef.current === location.key) return
    handledKeyRef.current = location.key

    const existing = conversations.find(c => c.name.toLowerCase() === incoming.ownerName.toLowerCase())

    if (existing) {
      setSelectedId(existing.id)
    } else {
      const newId = Date.now()
      const newConversation = {
        id: newId,
        name: incoming.ownerName,
        vehicle: incoming.vehicleName || '',
        time: 'Now',
        preview: 'Say hello to start the conversation.',
        unread: 0,
        avatar: initialsOf(incoming.ownerName),
        messages: [],
      }
      setConversations(prev => [newConversation, ...prev])
      setMessages(prev => ({ ...prev, [newId]: [] }))
      setSelectedId(newId)
    }

    // Clear the navigation state so refreshing or revisiting this page doesn't re-trigger it
    navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const selected = conversations.find(c => c.id === selectedId) || conversations[0]

  function sendMessage(e) {
    e.preventDefault()
    const text = draft.trim(); if (!text) return
    setMessages(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), { from: 'me', text, time: 'Now' }] }))
    setDraft('')
  }

  return (
    <div className="page-content" style={{maxWidth:1000}}>
      <h1 className="page-title">Messages</h1>
      <p className="page-subtitle">Communicate with vehicle owners and renters.</p>

      <section style={{height:620,display:'grid',gridTemplateColumns:'330px 1fr',background:'#111',border:'1px solid #1f1f1f',borderRadius:10,overflow:'hidden'}}>
        <aside style={{borderRight:'1px solid #1f1f1f',overflow:'auto'}}>
          <div style={{height:64,padding:'0 18px',display:'flex',alignItems:'center',gap:9,borderBottom:'1px solid #1f1f1f'}}>
            <h2 style={{color:'#fff',fontSize:15}}>Conversations</h2><span style={{minWidth:20,height:20,padding:'0 6px',borderRadius:10,background:'#1d4ed8',color:'#fff',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>{conversations.length}</span>
          </div>
          {conversations.map(c=>(
            <button key={c.id} onClick={()=>setSelectedId(c.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'14px 16px',textAlign:'left',background:selectedId===c.id?'#111827':'transparent',borderBottom:'1px solid #181818',color:'#fff'}}>
              <span style={{width:38,height:38,flexShrink:0,borderRadius:'50%',background:'#1d4ed8',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{c.avatar}</span>
              <span style={{minWidth:0,flex:1,display:'flex',flexDirection:'column'}}>
                <span style={{display:'flex',justifyContent:'space-between',gap:8}}><strong style={{fontSize:13}}>{c.name}</strong><small style={{color:'#666',fontSize:10}}>{c.time}</small></span>
                <span style={{color:'#777',fontSize:10}}>{c.vehicle}</span>
                <span style={{color:'#666',fontSize:11,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.preview}</span>
              </span>
              {c.unread>0 && <span style={{minWidth:18,height:18,borderRadius:9,background:'#fff',color:'#111',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>{c.unread}</span>}
            </button>
          ))}
        </aside>

        <section style={{display:'flex',flexDirection:'column',minWidth:0}}>
          <header style={{minHeight:64,padding:'12px 18px',display:'flex',alignItems:'center',gap:11,borderBottom:'1px solid #1f1f1f'}}>
            <span style={{width:38,height:38,flexShrink:0,borderRadius:'50%',background:'#1d4ed8',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{selected.avatar}</span>
            <div><h2 style={{color:'#fff',fontSize:15}}>{selected.name}</h2><p style={{color:'#666',fontSize:11}}>{selected.vehicle}</p></div>
            <span title="Available" style={{width:7,height:7,marginLeft:'auto',borderRadius:'50%',background:'#6fcf87'}} />
          </header>
          <div style={{flex:1,overflow:'auto',padding:'24px 20px',display:'flex',flexDirection:'column',gap:13}}>
            {(messages[selectedId]||[]).length > 0 ? (messages[selectedId]||[]).map((m,i)=><div key={i} style={{display:'flex',flexDirection:'column',maxWidth:'72%',alignSelf:m.from==='me'?'flex-end':'flex-start',alignItems:m.from==='me'?'flex-end':'flex-start'}}><div style={{padding:'10px 13px',borderRadius:10,background:m.from==='me'?'#111827':'#1a1a1a',color:m.from==='me'?'#fff':'#ddd',fontSize:12,border:'1px solid '+(m.from==='me'?'#172554':'#252525')}}>{m.text}</div><small style={{color:'#555',fontSize:9,margin:'4px 3px 0'}}>{m.time}</small></div>) : (
              <p style={{color:'#555',fontSize:12,margin:'auto'}}>No messages yet. Say hello to {selected.name}.</p>
            )}
          </div>
          <form onSubmit={sendMessage} style={{display:'flex',gap:8,padding:14,borderTop:'1px solid #1f1f1f'}}>
            <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Type a message..." aria-label="Type a message" style={{flex:1,minWidth:0,padding:'10px 12px',background:'#0b0b0b',border:'1px solid #242424',borderRadius:8,color:'#fff',outline:'none',fontSize:12}} />
            <button type="submit" style={{padding:'0 17px',borderRadius:8,background:'#1d4ed8',color:'#fff',fontSize:12,fontWeight:600}}>Send</button>
          </form>
        </section>
      </section>
    </div>
  )
}

export default Messages