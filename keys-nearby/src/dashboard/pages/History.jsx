// History.jsx — Combined My Listings and My Bookings history page
import { useState } from 'react'

const bookings = [
  { id: 1, vehicle: 'Hyundai Creta', date: '12 Aug 2026', duration: '2 days', amount: '₹3,600', status: 'Completed' },
  { id: 2, vehicle: 'Honda City', date: '28 Jul 2026', duration: '1 day', amount: '₹1,800', status: 'Completed' },
  { id: 3, vehicle: 'Maruti Swift', date: '15 Jun 2026', duration: '3 days', amount: '₹4,200', status: 'Cancelled' },
]

const listings = [
  { id: 4, vehicle: 'Tata Nexon', date: '05 Aug 2026', bookings: '4 bookings', amount: '₹7,200 earned', status: 'Active' },
  { id: 5, vehicle: 'Royal Enfield Classic 350', date: '19 Jul 2026', bookings: '2 bookings', amount: '₹2,800 earned', status: 'Active' },
]

const icon = (type) => type === 'listing' ? '▤' : '▣'

function History() {
  const [tab, setTab] = useState('all')

  const items = tab === 'bookings' ? bookings.map(x => ({ ...x, type: 'booking' }))
    : tab === 'listings' ? listings.map(x => ({ ...x, type: 'listing' }))
    : [...bookings.map(x => ({ ...x, type: 'booking' })), ...listings.map(x => ({ ...x, type: 'listing' }))]

  return (
    <div className="page-content" style={{ maxWidth: 980 }}>
      <h1 className="page-title">History</h1>
      <p className="page-subtitle">View your vehicle listings and booking history in one place.</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
        {[
          ['Total bookings','16'], ['Active listings','2'], ['This month','₹7,200']
        ].map(([label,value]) => (
          <div key={label} style={{ background:'#111', border:'1px solid #1f1f1f', borderRadius:10, padding:'18px 20px' }}>
            <div style={{ color:'#666', fontSize:12, marginBottom:4 }}>{label}</div>
            <strong style={{ color:'#fff', fontSize:21 }}>{value}</strong>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:4, borderBottom:'1px solid #1f1f1f', marginBottom:20 }}>
        {[['all','All activity'],['bookings','Bookings'],['listings','My listings']].map(([value,label]) => (
          <button key={value} onClick={() => setTab(value)} style={{ background: tab===value ? '#111827' : 'transparent', color:tab===value?'#fff':'#777', borderRadius:'7px 7px 0 0', padding:'9px 14px', fontSize:12, fontWeight:600 }}>
            {label}
          </button>
        ))}
      </div>

      <section style={{ marginBottom:26 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12 }}>
          <h2 style={{ color:'#fff', fontSize:16 }}>Recent activity</h2>
          <span style={{ color:'#666', fontSize:12 }}>{items.length} records</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {items.map(item => (
            <article key={item.id} style={{ display:'flex', alignItems:'center', gap:14, background:'#111', border:'1px solid #1f1f1f', borderRadius:10, padding:'15px 16px' }}>
              <div style={{ width:42,height:42,flexShrink:0,borderRadius:8,background:'#111827',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>{icon(item.type)}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <h3 style={{ fontSize:14,color:'#fff',fontWeight:600 }}>{item.vehicle}</h3>
                  <span style={{ fontSize:10,fontWeight:600,padding:'3px 7px',borderRadius:999,background:'#191919',color:item.status==='Cancelled'?'#e6a2a2':item.status==='Completed'?'#a3e0b1':'#a3e0b1' }}>{item.status}</span>
                </div>
                <p style={{ color:'#666',fontSize:12,marginTop:3 }}>{item.type==='listing'?'Your listing':'Booked vehicle'} · {item.type==='listing'?'Listed ':''}{item.date} · {item.type==='listing'?item.bookings:item.duration}</p>
              </div>
              <strong style={{ color:'#ddd',fontSize:13,whiteSpace:'nowrap' }}>{item.amount}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default History
