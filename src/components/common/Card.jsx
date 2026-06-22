/**
 * Card Component
 * 
 * 재사용 가능한 카드 컴포넌트
 */

function Card({
  as: Component = 'article',
  variant = 'default',
  icon,
  title,
  description,
  children,
  actions,
  className = '',
  ...props
}) {
  const cardClass = ['card', `card-${variant}`, className].filter(Boolean).join(' ')

  return (
    <Component className={cardClass} {...props}>
      {icon && (
        <div className="card-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      {(title || description) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {description && <p className="card-description">{description}</p>}
        </div>
      )}
      {children && <div className="card-content">{children}</div>}
      {actions && <div className="card-actions">{actions}</div>}
    </Component>
  )
}

export default Card
