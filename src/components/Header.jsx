import './Header.css'

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Byt – energie & voda</span>
        </div>
        <p className="tagline">Sledování spotřeby a nákladů</p>
      </div>
    </header>
  )
}
