import { formatDate } from '../../utils/blog.utils'

interface BlogMetaProps {
  author: string
  authorRole?: string
  authorAvatar?: string
  publishedAt: string
  updatedAt?: string
  readingTime: number
  category?: string
  compact?: boolean
}

export default function BlogMeta({
  author,
  authorRole,
  authorAvatar,
  publishedAt,
  updatedAt,
  readingTime,
  category,
  compact = false
}: BlogMetaProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs text-light-muted">
        <span>{formatDate(publishedAt)}</span>
        <span>•</span>
        <span>{readingTime} min de leitura</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-light-muted">
      <div className="flex items-center gap-2">
        {authorAvatar ? (
          <img 
            src={authorAvatar} 
            alt={author}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
        <div>
          <span className="font-medium text-light">{author}</span>
          {authorRole && (
            <span className="text-xs text-light-muted ml-1">({authorRole})</span>
          )}
        </div>
      </div>
      <span>•</span>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDate(publishedAt)}</span>
        {updatedAt && updatedAt !== publishedAt && (
          <>
            <span className="text-xs">(atualizado em {formatDate(updatedAt)})</span>
          </>
        )}
      </div>
      <span>•</span>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{readingTime} min de leitura</span>
      </div>
      {category && (
        <>
          <span>•</span>
          <span className="text-primary font-semibold">{category}</span>
        </>
      )}
    </div>
  )
}

