/**
 * Header Layout Component
 * 
 * 페이지 상단에 표시되는 헤더 레이아웃
 */

function Header({ title, subtitle }) {
  return (
    <header className="layout-header">
      <div className="header-content">
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
    </header>
  )
}

export default Header
