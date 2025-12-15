import { ReactNode } from 'react'

export interface BlogArticle {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  author?: string
  publishedAt: string | null
  updatedAt?: string
  readingTime: number
  category: string
  featuredImage: string | null
  featuredImageAlt?: string | null
  excerpt: string
  content?: ReactNode | string
  cta?: {
    title: string
    description: string
    buttonText: string
  }
  categoryRelation?: {
    id?: string
    name: string
    slug: string
    icon?: string | null
  } | null
  authorRelation?: {
    id?: string
    name: string
    role?: string | null
    avatar?: string | null
  } | null
  viewsCount?: number
  isFeatured?: boolean
  isPillar?: boolean
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  _count?: {
    articles: number
  }
}

