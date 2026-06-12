/**
 * Button Component
 * 
 * 재사용 가능한 버튼 컴포넌트
 */

function Button({ variant = 'primary', children, ...props }) {
  const buttonClass = `btn btn-${variant}`
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  )
}

export default Button
