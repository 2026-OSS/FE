/**
 * Card Component
 * 
 * 재사용 가능한 카드 컴포넌트
 */

function Card({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title && <div className="card-title">{title}</div>}
      <div className="card-content">{children}</div>
    </div>
  )
}

export default Card
