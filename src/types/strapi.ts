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
    logo: {
        data: StrapiImage
    }
    favicon: {
        data: StrapiImage[]
    }
    createdAt: string
    updatedAt: string
    publishedAt: string
}

export interface MenuItem {
    id: number
    title: string
    url: string
    order: number
    visible: boolean
    children?: MenuItem[]
    parent?: {
        id: number
        title: string
        url: string
        order: number
        visible: boolean
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