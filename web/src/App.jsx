import React, { useState, useEffect } from 'react'
import { IntMaxNodeClient } from 'intmax2-server-sdk'

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
  const [client] = useState(() => (
    new IntMaxNodeClient({
        environment: 'testnet',
        eth_private_key: 'import.meta.env.VITE_ETH_PRIVATE_KEY', // <-- put your testnet private key here or use import.meta.env.VITE_ETH_PRIVATE_KEY
        l1_rpc_url: 'import.meta.env.VITE_ETH_PRIVATE_KEY',      // <-- put your testnet RPC URL here or use import.meta.env.VITE_L1_RPC_URL
    })
  ));
  const [requestResult, setRequestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const doLogin = async () => {
      try {
        console.log('Logging in...');
        await client.login();
        console.log('Logged in...');
      } catch (e) {
        // Optionally handle login error
      }
    };
    doLogin();
  }, [client]);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id)
  }

  const handleRequest = async () => {
    setLoading(true)
    setError(null)
    setRequestResult(null)
    try {
      const data = await client.fetchTransactions({});
      setRequestResult(data)
    } catch (e) {
      setError('Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Список організацій</h1>
      <button
        onClick={handleRequest}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Get Transactions
      </button>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {requestResult && (
        <pre
          style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}
        >
          {JSON.stringify(requestResult, null, 2)}
        </pre>
      )}
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