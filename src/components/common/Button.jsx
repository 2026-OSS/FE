/**
 * Button Component
 * 
 * 재사용 가능한 버튼 컴포넌트
 */

function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'right',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) {
  const buttonClass = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    icon ? `btn-icon-${iconPosition}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={buttonClass}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <span className="btn-spinner" aria-hidden="true" />}
      {icon && iconPosition === 'left' && !isLoading && (
        <span className="btn-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="btn-label">{children}</span>
      {icon && iconPosition === 'right' && !isLoading && (
        <span className="btn-icon" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  )
}

export default Button
