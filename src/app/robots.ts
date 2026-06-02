import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://openshop.yoga"

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/checkout',
                '/account',
                '/cart',
                '/admin',
                '/api'
            ],
        },
        sitemap: `${baseUrl}/sitemap_new.xml`,
    }
}