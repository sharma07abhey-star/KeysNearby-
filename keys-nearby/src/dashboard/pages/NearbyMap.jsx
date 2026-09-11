// NearbyMap.jsx — Map view showing vehicles pinned near your location
import { useState } from 'react'

const vehicles=[
 {id:1,name:'Hyundai Creta',location:'1.2 km away',price:'₹1,800/day',top:'28%',left:'44%',rating:'4.9'},
 {id:2,name:'Honda City',location:'2.1 km away',price:'₹1,600/day',top:'46%',left:'67%',rating:'4.8'},
 {id:3,name:'Tata Nexon',location:'2.8 km away',price:'₹1,500/day',top:'66%',left:'38%',rating:'4.7'},
 {id:4,name:'Maruti Swift',location:'3.4 km away',price:'₹1,300/day',top:'57%',left:'20%',rating:'4.8'},
 {id:5,name:'Kia Seltos',location:'4.1 km away',price:'₹2,100/day',top:'22%',left:'78%',rating:'4.9'},
]

function NearbyMap(){
 const [selectedId,setSelectedId]=useState(1)
 const [search,setSearch]=useState('')
 const visible=vehicles.filter(v=>v.name.toLowerCase().includes(search.toLowerCase()))
 const selected=vehicles.find(v=>v.id===selectedId)||vehicles[0]
 return <div className="page-content" style={{maxWidth:1100}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:20}}><div><h1 className="page-title">Nearby Map</h1><p className="page-subtitle">See available vehicles pinned on a map around your current location.</p></div><div style={{color:'#aaa',background:'#111',border:'1px solid #1f1f1f',borderRadius:8,padding:'8px 11px',fontSize:11,whiteSpace:'nowrap'}}>{visible.length} vehicles nearby</div></div>
   <section style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 330px',gap:12}}>
     <div style={{position:'relative',height:600,overflow:'hidden',borderRadius:10,border:'1px solid #1f1f1f',background:'#0d1117'}}>
       <div style={{position:'absolute',inset:0,opacity:.5,backgroundImage:'linear-gradient(#18202b 1px, transparent 1px),linear-gradient(90deg,#18202b 1px,transparent 1px)',backgroundSize:'55px 55px'}} />
       <div style={{position:'absolute',width:'120%',height:45,top:'40%',left:'-10%',background:'#171d25',border:'1px solid #202a36',transform:'rotate(-28deg)'}} />
       <div style={{position:'absolute',width:45,height:'120%',top:'-10%',left:'59%',background:'#171d25',border:'1px solid #202a36',transform:'rotate(25deg)'}} />
       <div style={{position:'absolute',width:'90%',height:32,top:'68%',left:'4%',background:'#171d25',border:'1px solid #202a36',transform:'rotate(12deg)'}} />
       <span style={{position:'absolute',top:'23%',left:'14%',color:'#394554',fontSize:10,fontWeight:600}}>Central Market</span><span style={{position:'absolute',top:'55%',left:'69%',color:'#394554',fontSize:10,fontWeight:600}}>City Park</span><span style={{position:'absolute',top:'78%',left:'18%',color:'#394554',fontSize:10,fontWeight:600}}>Main Road</span>
       <div title="Your location" style={{position:'absolute',top:'52%',left:'51%',width:20,height:20,margin:-10,borderRadius:'50%',background:'#1d4ed8',border:'5px solid rgba(29,78,216,.25)',boxShadow:'0 0 0 4px rgba(29,78,216,.12)'}}><span style={{display:'block',width:6,height:6,margin:2,borderRadius:'50%',background:'#fff'}} /></div>
       {visible.map(v=><button key={v.id} onClick={()=>setSelectedId(v.id)} title={v.name} style={{position:'absolute',top:v.top,left:v.left,width:selectedId===v.id?38:34,height:selectedId===v.id?38:34,transform:'translate(-50%,-50%)',borderRadius:'50% 50% 50% 4px',rotate:'-45deg',background:selectedId===v.id?'#fff':'#1d4ed8',color:selectedId===v.id?'#111':'#fff',border:'3px solid #0d1117',boxShadow:'0 5px 14px rgba(0,0,0,.35)'}}><span style={{display:'block',rotate:'45deg',fontSize:12}}>▣</span></button>)}
       <div style={{position:'absolute',left:12,bottom:12,display:'flex',flexDirection:'column',gap:7,padding:'10px 11px',borderRadius:8,background:'rgba(10,10,10,.9)',border:'1px solid #252525',color:'#777',fontSize:10}}><span><i style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:'#1d4ed8',marginRight:7}} />Your location</span><span><i style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:'#fff',marginRight:7}} />Available vehicle</span></div>
     </div>
     <aside style={{background:'#111',border:'1px solid #1f1f1f',borderRadius:10,overflow:'hidden',display:'flex',flexDirection:'column',minHeight:600}}>
       <div style={{padding:14,borderBottom:'1px solid #1f1f1f'}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vehicles..." aria-label="Search vehicles" style={{width:'100%',padding:'10px 11px',borderRadius:8,background:'#0b0b0b',border:'1px solid #242424',color:'#fff',outline:'none',fontSize:12}} /></div>
       <div style={{padding:'14px 14px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2 style={{color:'#fff',fontSize:14}}>Available nearby</h2><span style={{color:'#555',fontSize:10}}>Within 5 km</span></div>
       <div style={{overflow:'auto',padding:'0 10px'}}>{visible.length?visible.map(v=><button key={v.id} onClick={()=>setSelectedId(v.id)} style={{width:'100%',display:'flex',gap:10,padding:'10px 5px',borderRadius:8,background:selectedId===v.id?'#111827':'transparent',textAlign:'left',color:'#fff'}}><span style={{width:48,height:42,flexShrink:0,borderRadius:7,background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',color:'#777'}}>▣</span><span style={{display:'flex',flexDirection:'column',minWidth:0}}><strong style={{fontSize:12}}>{v.name}</strong><small style={{color:'#666',fontSize:10,marginTop:2}}>{v.location} · ★ {v.rating}</small><b style={{color:'#aaa',fontSize:10,marginTop:3}}>{v.price}</b></span></button>):<div style={{color:'#666',padding:20,fontSize:12}}>No vehicles match your search.</div>}</div>
       <div style={{margin:'auto 14px 14px',padding:13,display:'flex',flexDirection:'column',gap:2,border:'1px solid #242424',borderRadius:8,background:'#0d0d0d'}}><span style={{color:'#555',fontSize:9,textTransform:'uppercase',letterSpacing:.4}}>Selected vehicle</span><strong style={{color:'#fff',fontSize:13}}>{selected.name}</strong><span style={{color:'#666',fontSize:10}}>{selected.location} · {selected.price}</span></div>
     </aside>
   </section>
 </div>
}
export default NearbyMap
