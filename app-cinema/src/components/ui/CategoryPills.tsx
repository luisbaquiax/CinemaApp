interface Props {
  categorias: string[]
  activa: string
  onSelect: (cat: string) => void
}

const CategoryPills = ({ categorias, activa, onSelect }: Props) => {
  return (
    <div className="flex gap-2 justify-center flex-wrap px-8 pt-3 pb-1 animate-fade-up">
      {categorias.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className="px-3 py-1 rounded-full text-xs font-medium transition-all"
          style={{
            background: activa === cat ? 'rgba(37,99,235,0.35)' : 'rgba(30,64,175,0.2)',
            border: `1px solid ${activa === cat ? 'var(--blue-glow)' : 'rgba(96,165,250,0.18)'}`,
            color: activa === cat ? 'var(--blue-glow)' : '#94a3b8',
            cursor: 'pointer'
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

export default CategoryPills