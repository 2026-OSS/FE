/**
 * Container Layout Component
 * 
 * 페이지의 컨텐츠를 감싸는 컨테이너 레이아웃
 */

function Container({ children, className = '' }) {
  return <div className={`container ${className}`}>{children}</div>
}

export default Container
