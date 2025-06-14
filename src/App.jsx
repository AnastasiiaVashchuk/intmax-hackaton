import React, { useState } from 'react'

const organizations = [
  {
    id: 1,
    name: 'Save the Forest',
    description: 'Цей проєкт займається охороною лісів в Карпатах.',
    donateLink: 'https://example.com/donate/forest'
  },
  {
    id: 2,
    name: 'Help Children',
    description: 'Допомога дітям із зони бойових дій.',
    donateLink: 'https://example.com/donate/children'
  }
]

const App = () => {
  const [openId, setOpenId] = useState(null)

  const toggle = (id) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Список організацій</h1>
      {organizations.map(org => (
        <div key={org.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
          <h2
            style={{ cursor: 'pointer', color: '#007bff' }}
            onClick={() => toggle(org.id)}
          >
            {org.name}
          </h2>
          {openId === org.id && (
            <div>
              <p>{org.description}</p>
              <a
                href={org.donateLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#28a745',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                Donate
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default App