import { useState } from 'react'

interface Props {
  onSearch: (query: string) => void
}

const SearchBar = ({ onSearch }: Props) => {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <div className="flex justify-center px-8 pt-5 animate-fade-up">
      <div className="flex items-center gap-2 w-full max-w-xl px-4 py-2 rounded-2xl"
        style={{
          background: 'rgba(30,64,175,0.22)',
          border: '1px solid rgba(96,165,250,0.2)',
          backdropFilter: 'blur(8px)'
        }}>

        <span style={{ color: '#94a3b8' }}>🔍</span>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Busca por título..."
          className="flex-1 bg-transparent border-none outline-none text-sm"
          style={{ color: '#f1f5f9', fontFamily: "'DM Sans', sans-serif" }}
        />

        <button
          onClick={handleSearch}
          className="px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
          style={{ background: 'var(--blue-mid)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-light)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue-mid)')}
        >
          Buscar
        </button>
      </div>
    </div>
  )
}

export default SearchBar