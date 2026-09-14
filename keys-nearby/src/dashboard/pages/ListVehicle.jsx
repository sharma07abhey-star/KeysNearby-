// ListVehicle.jsx — Form to list your own vehicle for rent, with basic validation

import { useState } from 'react'

const initialForm = {
  vehicleType: 'Car',
  name: '',
  regNumber: '',
  location: '',
  price: '',
  availableFrom: '',
  availableTo: '',
  description: '',
}

const initialListings = [
  { id: 1, vehicleType: 'Car', name: 'Tata Nexon', regNumber: 'HR26 AB 4521', location: 'Sector 45, Gurugram', price: 1500, availableFrom: '2026-09-15', availableTo: '2026-09-30', description: 'Well maintained, automatic, electric variant.', status: 'Active' },
  { id: 2, vehicleType: 'Bike', name: 'Royal Enfield Classic 350', regNumber: 'HR51 CD 8890', location: 'Sohna Road, Gurugram', price: 700, availableFrom: '2026-09-10', availableTo: '2026-09-25', description: 'Great for weekend rides.', status: 'Active' },
]

function ListVehicle() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [listings, setListings] = useState(initialListings)
  const [toast, setToast] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Vehicle name is required.'
    if (!form.regNumber.trim()) next.regNumber = 'Registration number is required.'
    if (!form.location.trim()) next.location = 'Location is required.'
    if (!form.price || Number(form.price) <= 0) next.price = 'Enter a valid daily price.'
    if (!form.availableFrom) next.availableFrom = 'Start date is required.'
    if (!form.availableTo) next.availableTo = 'End date is required.'
    if (form.availableFrom && form.availableTo && form.availableTo < form.availableFrom) {
      next.availableTo = 'End date must be after the start date.'
    }
    return next
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const newListing = {
      id: Date.now(),
      ...form,
      price: Number(form.price),
      status: 'Active',
    }

    setListings(prev => [newListing, ...prev])
    setForm(initialForm)
    setErrors({})
    setToast('Your vehicle has been listed successfully.')
    setTimeout(() => setToast(''), 3000)
  }

  function removeListing(id) {
    setListings(prev => prev.filter(item => item.id !== id))
  }

  function toggleStatus(id) {
    setListings(prev => prev.map(item =>
      item.id === id ? { ...item, status: item.status === 'Active' ? 'Paused' : 'Active' } : item
    ))
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    background: '#0b0b0b',
    border: '1px solid ' + (hasError ? '#8a3a3a' : '#242424'),
    color: '#fff',
    outline: 'none',
    fontSize: 13,
  })

  const fieldWrap = { display: 'flex', flexDirection: 'column', gap: 6 }
  const labelStyle = { color: '#999', fontSize: 12, fontWeight: 600 }
  const errorStyle = { color: '#e6a2a2', fontSize: 11 }

  return (
    <div className="page-content" style={{ maxWidth: 980 }}>
      <h1 className="page-title">List My Vehicle</h1>
      <p className="page-subtitle">Rent out your personal vehicle to earn money when it is parked.</p>

      {toast && (
        <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 8, background: '#16311d', border: '1px solid #1f4a2b', color: '#a3e0b1', fontSize: 13 }}>
          ✓ {toast}
        </div>
      )}

      {/* Listing form */}
      <form onSubmit={handleSubmit} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 22, marginBottom: 30 }}>
        <h2 style={{ color: '#fff', fontSize: 16, marginBottom: 18 }}>Vehicle details</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="vehicleType">Vehicle type</label>
            <select id="vehicleType" name="vehicleType" value={form.vehicleType} onChange={handleChange} style={inputStyle(false)}>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
            </select>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="name">Vehicle name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Hyundai Creta" style={inputStyle(errors.name)} />
            {errors.name && <span style={errorStyle}>{errors.name}</span>}
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="regNumber">Registration number</label>
            <input id="regNumber" name="regNumber" value={form.regNumber} onChange={handleChange} placeholder="e.g. HR26 AB 1234" style={inputStyle(errors.regNumber)} />
            {errors.regNumber && <span style={errorStyle}>{errors.regNumber}</span>}
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="location">Location</label>
            <input id="location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Sector 14, Gurugram" style={inputStyle(errors.location)} />
            {errors.location && <span style={errorStyle}>{errors.location}</span>}
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="price">Price per day (₹)</label>
            <input id="price" name="price" type="number" min="1" value={form.price} onChange={handleChange} placeholder="e.g. 1500" style={inputStyle(errors.price)} />
            {errors.price && <span style={errorStyle}>{errors.price}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={fieldWrap}>
              <label style={labelStyle} htmlFor="availableFrom">Available from</label>
              <input id="availableFrom" name="availableFrom" type="date" value={form.availableFrom} onChange={handleChange} style={inputStyle(errors.availableFrom)} />
              {errors.availableFrom && <span style={errorStyle}>{errors.availableFrom}</span>}
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle} htmlFor="availableTo">Available to</label>
              <input id="availableTo" name="availableTo" type="date" value={form.availableTo} onChange={handleChange} style={inputStyle(errors.availableTo)} />
              {errors.availableTo && <span style={errorStyle}>{errors.availableTo}</span>}
            </div>
          </div>
        </div>

        <div style={{ ...fieldWrap, marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add any details renters should know — condition, fuel type, pickup instructions..."
            rows={3}
            style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <button type="submit" style={{ padding: '12px 22px', borderRadius: 8, background: '#1d4ed8', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none' }}>
          List my vehicle
        </button>
      </form>

      {/* My listings */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h2 style={{ color: '#fff', fontSize: 16 }}>My listings</h2>
          <span style={{ color: '#666', fontSize: 12 }}>{listings.length} vehicles</span>
        </div>

        {listings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {listings.map(item => (
              <article key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: '15px 16px' }}>
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 8, background: '#0d0d0d', border: '1px solid #242424', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {item.vehicleType === 'Bike' ? '🏍️' : '🚗'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{item.name}</h3>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 999, background: '#191919', color: item.status === 'Active' ? '#a3e0b1' : '#e0c98a' }}>{item.status}</span>
                  </div>
                  <p style={{ color: '#666', fontSize: 12, marginTop: 3 }}>{item.regNumber} · {item.location}</p>
                  <p style={{ color: '#555', fontSize: 11, marginTop: 2 }}>Available {item.availableFrom} to {item.availableTo}</p>
                </div>

                <strong style={{ color: '#ddd', fontSize: 13, whiteSpace: 'nowrap' }}>₹{item.price}/day</strong>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleStatus(item.id)} style={{ padding: '8px 12px', borderRadius: 7, background: 'transparent', border: '1px solid #242424', color: '#ccc', fontSize: 11 }}>
                    {item.status === 'Active' ? 'Pause' : 'Activate'}
                  </button>
                  <button onClick={() => removeListing(item.id)} style={{ padding: '8px 12px', borderRadius: 7, background: 'transparent', border: '1px solid #3a2323', color: '#e6a2a2', fontSize: 11 }}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="page-placeholder">You haven't listed any vehicles yet.</div>
        )}
      </section>
    </div>
  )
}

export default ListVehicle