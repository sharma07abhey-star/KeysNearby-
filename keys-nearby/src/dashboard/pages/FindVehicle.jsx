// FindVehicle.jsx — Search, filter, and browse vehicles available nearby

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const vehicles = [
  { id: 1, name: 'Hyundai Creta', type: 'Car', owner: 'Meera Nair', location: 'Sector 14, Gurugram', distance: '1.2 km away', price: 1800, rating: 4.9, seats: '5 seats', fuel: 'Petrol', img: '🚗' },
  { id: 2, name: 'Honda City', type: 'Car', owner: 'Devansh Rao', location: 'DLF Phase 2', distance: '2.1 km away', price: 1600, rating: 4.8, seats: '5 seats', fuel: 'Petrol', img: '🚗' },
  { id: 3, name: 'Royal Enfield Classic 350', type: 'Bike', owner: 'Farhan Ali', location: 'Sohna Road', distance: '2.6 km away', price: 700, rating: 4.7, seats: '2 seats', fuel: 'Petrol', img: '🏍️' },
  { id: 4, name: 'Tata Nexon', type: 'Car', owner: 'Sneha Kapoor', location: 'Cyber Hub', distance: '2.8 km away', price: 1500, rating: 4.7, seats: '5 seats', fuel: 'Electric', img: '🚗' },
  { id: 5, name: 'Activa 6G', type: 'Bike', owner: 'Vikram Singh', location: 'Sector 29', distance: '3.0 km away', price: 400, rating: 4.6, seats: '2 seats', fuel: 'Petrol', img: '🛵' },
  { id: 6, name: 'Maruti Swift', type: 'Car', owner: 'Anita Desai', location: 'MG Road', distance: '3.4 km away', price: 1300, rating: 4.8, seats: '5 seats', fuel: 'Petrol', img: '🚗' },
  { id: 7, name: 'Kia Seltos', type: 'Car', owner: 'Karan Malhotra', location: 'Golf Course Road', distance: '4.1 km away', price: 2100, rating: 4.9, seats: '5 seats', fuel: 'Diesel', img: '🚗' },
  { id: 8, name: 'KTM Duke 200', type: 'Bike', owner: 'Ishaan Roy', location: 'Sector 56', distance: '4.5 km away', price: 900, rating: 4.6, seats: '2 seats', fuel: 'Petrol', img: '🏍️' },
]

const typeFilters = ['All', 'Car', 'Bike']
const sortOptions = [
  { value: 'nearest', label: 'Nearest first' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
]

function FindVehicle() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [sortBy, setSortBy] = useState('nearest')
  const [maxPrice, setMaxPrice] = useState(2500)
  const [selectedId, setSelectedId] = useState(null)
  const [requestedIds, setRequestedIds] = useState([])

  let results = vehicles.filter(v =>
    (type === 'All' || v.type === type) &&
    v.price <= maxPrice &&
    (v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase()))
  )

  if (sortBy === 'price-low') results = [...results].sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-high') results = [...results].sort((a, b) => b.price - a.price)
  else if (sortBy === 'rating') results = [...results].sort((a, b) => b.rating - a.rating)
  else results = [...results].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))

  const selected = vehicles.find(v => v.id === selectedId)

  function handleRequest(id) {
    if (!requestedIds.includes(id)) {
      setRequestedIds(prev => [...prev, id])
    }
  }

  function handleCancelRequest(id) {
    setRequestedIds(prev => prev.filter(reqId => reqId !== id))
  }

  function handleMessageOwner(vehicle) {
    // Hands off to the Messages page (owned by the messages page itself);
    // we pass the owner + vehicle along in navigation state so a thread can be pre-selected.
    navigate('/dashboard/messages', { state: { ownerName: vehicle.owner, vehicleName: vehicle.name } })
  }

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      <h1 className="page-title">Find a Vehicle</h1>
      <p className="page-subtitle">Search and filter vehicles available near your location.</p>

      {/* Filters bar */}
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', background: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: '16px 18px', marginBottom: 22 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by vehicle or area..."
          aria-label="Search vehicles"
          style={{ flex: '1 1 220px', minWidth: 180, padding: '10px 12px', borderRadius: 8, background: '#0b0b0b', border: '1px solid #242424', color: '#fff', outline: 'none', fontSize: 13 }}
        />

        <div style={{ display: 'flex', gap: 6 }}>
          {typeFilters.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: '9px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: type === t ? '#1d4ed8' : '#0b0b0b',
                color: '#fff',
                border: '1px solid ' + (type === t ? '#1d4ed8' : '#242424'),
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888' }}>
          Max price ₹{maxPrice}/day
          <input
            type="range"
            min="300"
            max="2500"
            step="100"
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            style={{ width: 130 }}
          />
        </label>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          aria-label="Sort by"
          style={{ padding: '10px 12px', borderRadius: 8, background: '#0b0b0b', border: '1px solid #242424', color: '#fff', fontSize: 12 }}
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h2 style={{ color: '#fff', fontSize: 16 }}>Available vehicles</h2>
        <span style={{ color: '#666', fontSize: 12 }}>{results.length} results</span>
      </div>

      {/* Results grid */}
      {results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {results.map(v => {
            const requested = requestedIds.includes(v.id)
            return (
              <article key={v.id} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 8, background: '#0d0d0d', border: '1px solid #242424', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{v.img}</div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{v.name}</h3>
                    <p style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{v.distance} · ★ {v.rating}</p>
                  </div>
                </div>

                <p style={{ color: '#888', fontSize: 12 }}>{v.location}</p>
                <p style={{ color: '#666', fontSize: 11 }}>{v.seats} · {v.fuel} · Hosted by {v.owner}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <strong style={{ color: '#fff', fontSize: 15 }}>₹{v.price}<span style={{ color: '#666', fontWeight: 400, fontSize: 11 }}>/day</span></strong>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setSelectedId(v.id)}
                      style={{ padding: '8px 12px', borderRadius: 7, background: 'transparent', border: '1px solid #242424', color: '#ccc', fontSize: 12 }}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleMessageOwner(v)}
                      style={{ padding: '8px 12px', borderRadius: 7, background: 'transparent', border: '1px solid #242424', color: '#ccc', fontSize: 12 }}
                    >
                      Message owner
                    </button>
                    {requested ? (
                      <button
                        onClick={() => handleCancelRequest(v.id)}
                        style={{ padding: '8px 12px', borderRadius: 7, background: '#16311d', border: '1px solid #1f4a2b', color: '#a3e0b1', fontSize: 12, fontWeight: 600 }}
                      >
                        Requested ✓ · Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequest(v.id)}
                        style={{ padding: '8px 12px', borderRadius: 7, background: '#1d4ed8', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none' }}
                      >
                        Request to book
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="page-placeholder">No vehicles match your search. Try adjusting your filters.</div>
      )}

      {/* Details modal for selected vehicle */}
      {selected && (
        <div
          onClick={() => setSelectedId(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
        >
          <section
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 520, maxHeight: '85vh', overflow: 'auto', background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 22 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 17 }}>{selected.name}</h2>
                <p style={{ color: '#777', fontSize: 12, marginTop: 4 }}>{selected.location} · {selected.distance}</p>
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close details" style={{ color: '#888', fontSize: 13, background: 'transparent', border: 'none' }}>✕ Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 18 }}>
              {[
                ['Type', selected.type],
                ['Seats', selected.seats],
                ['Fuel', selected.fuel],
                ['Rating', '★ ' + selected.rating],
              ].map(([label, value]) => (
                <div key={label} style={{ background: '#0d0d0d', border: '1px solid #242424', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>{label}</div>
                  <strong style={{ color: '#fff', fontSize: 13 }}>{value}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ color: '#666', fontSize: 12 }}>Hosted by {selected.owner}</p>
                <strong style={{ color: '#fff', fontSize: 18 }}>₹{selected.price}<span style={{ color: '#666', fontWeight: 400, fontSize: 12 }}>/day</span></strong>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleMessageOwner(selected)}
                  style={{ padding: '11px 18px', borderRadius: 8, background: 'transparent', border: '1px solid #242424', color: '#ccc', fontSize: 13 }}
                >
                  Message owner
                </button>
                {requestedIds.includes(selected.id) ? (
                  <button
                    onClick={() => handleCancelRequest(selected.id)}
                    style={{ padding: '11px 20px', borderRadius: 8, background: '#16311d', border: '1px solid #1f4a2b', color: '#a3e0b1', fontSize: 13, fontWeight: 600 }}
                  >
                    Request sent ✓ · Cancel request
                  </button>
                ) : (
                  <button
                    onClick={() => handleRequest(selected.id)}
                    style={{ padding: '11px 20px', borderRadius: 8, background: '#1d4ed8', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none' }}
                  >
                    Request to book
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default FindVehicle