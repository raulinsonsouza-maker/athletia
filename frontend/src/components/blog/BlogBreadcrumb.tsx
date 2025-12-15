import { Link } from 'react-router-dom'

interface BlogBreadcrumbProps {
  items: Array<{
    label: string
    href?: string
  }>
}

export default function BlogBreadcrumb({ items }: BlogBreadcrumbProps) {
  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-light-muted">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-light">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
