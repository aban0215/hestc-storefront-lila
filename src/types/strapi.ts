// types/strapi.ts
export interface StrapiImage {
    id: number
    name: string
    alternativeText: string | null
    caption: string | null
    width: number
    height: number
    formats: {
        thumbnail?: {
            url: string
            width: number
            height: number
        }
        small?: {
            url: string
            width: number
            height: number
        }
        medium?: {
            url: string
            width: number
            height: number
        }
        large?: {
            url: string
            width: number
            height: number
        }
    }
    hash: string
    ext: string
    mime: string
    size: number
    url: string
    previewUrl: string | null
    provider: string
    provider_metadata: any | null
    createdAt: string
    updatedAt: string
    publishedAt: string
}

export interface BrandData {
    id: number
    sitename: string
    logo: StrapiImage | null
    favicon: StrapiImage[]
    createdAt: string
    updatedAt: string
    publishedAt: string
}

export interface MenuItem {
    id: number
    documentId: string
    title: string
    slug: string
    url: string
    link_type: 'category' | 'collection' | 'blog' | 'page'
    medusaHandle?: string
    order: number
    visible: boolean
    children?: MenuItem[]
    parent?: {
        id: number
        documentId: string
        title: string
        slug: string
        link_type: string
    } | null
    createdAt: string
    updatedAt: string
    publishedAt: string
}

export interface StrapiResponse<T> {
    data: T
    meta?: {
        pagination?: {
            page: number
            pageSize: number
            pageCount: number
            total: number
        }
    }
}