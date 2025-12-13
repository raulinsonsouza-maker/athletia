import { ReactNode } from 'react'

export interface BlogArticle {
  id: string
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  author: string
  publishedAt: string
  updatedAt?: string
  readingTime: number
  category: string
  featuredImage: string
  featuredImageAlt: string
  excerpt: string
  content: ReactNode
  cta: {
    title: string
    description: string
    buttonText: string
  }
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
}

