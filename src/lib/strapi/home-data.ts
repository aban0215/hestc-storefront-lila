const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export interface StrapiImage {
    id: number
    url: string
    alternativeText?: string
    formats?: {
        thumbnail?: { url: string }
        small?: { url: string }
        medium?: { url: string }
        large?: { url: string }
    }
}

export interface HomeHeroData {
    id: number
    title: string
    subtitle?: string
    buttonText: string
    buttonLink: string
    link_type: 'category' | 'collection' | 'product' | 'external'
    medusa_handle: string
    active: boolean
    overlayOpacity?: number
    backgroundImage: StrapiImage
}

// 获取Hero数据
export async function getHomeHero(locale: string): Promise<HomeHeroData | null> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-home-hero?populate=*&locale=${locale}`,
            {
                next: { revalidate: 3600 }
            }
        )

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

        const response = await res.json()
        const data = response.data

        if (!data || !data.active) return null

        const prefixUrl = (url: string) => url?.startsWith('https://') ? url : url?.startsWith('http://') ? url.replace('http://', 'https://') : `${STRAPI_BASE_URL}${url}`

        return {
            id: data.id,
            title: data.title,
            subtitle: data.subtitle,
            buttonText: data.buttonText,
            linkType: data.link_type,
            medusaHandle: data.medusa_handle,
            active: data.active,
            overlayOpacity: data.overlayOpacity,
            backgroundImage: data.backgroundImage ? {
                id: data.backgroundImage.id,
                url: prefixUrl(data.backgroundImage.url),
                alternativeText: data.backgroundImage.alternativeText,
                formats: data.backgroundImage.formats
            } : null,
            mobileImage: data.mobileImage ? {
                id: data.mobileImage.id,
                url: prefixUrl(data.mobileImage.url),
                alternativeText: data.mobileImage.alternativeText,
                formats: data.mobileImage.formats
            } : null
        }
    } catch (error) {
        console.error('获取Hero数据失败:', error)
        return null
    }
}

//获取分类数据
export interface HomeCategorySectionData {
    id: number
    title: string
    subtitle: string
    featuredCategories: {
        id: number
        name: string
        slug: string
        description: string
        buttonText: string
        buttonLink: string
        link_type: 'category' | 'collection' | 'product' | 'external'
        medusa_handle: string
        order: number
        featured: boolean
        image: StrapiImage  // 现在包含图片数据了
    }[]
}

// 更新getHomeCategorySection函数
export async function getHomeCategorySection(locale: string): Promise<HomeCategorySectionData | null> {
    try {
        const prefixUrl = (url: string) => url?.startsWith('https://') ? url : url?.startsWith('http://') ? url.replace('http://', 'https://') : `${STRAPI_BASE_URL}${url}`

        const apiUrl =`${STRAPI_BASE_URL}/api/lila-home-category-section?populate[featuredCategories][populate]=image&locale=${locale}`;

        // 2. 打印访问的 URL
        console.log("Fetching Strapi Category Section from:", apiUrl);

        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-home-category-section?populate[featuredCategories][populate]=image&locale=${locale}`,
            {
                next: { revalidate: 3600 }
            }
        )
        console.log()
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        if (!data.data) {
            return null
        }

        const featuredCategories = data.data.featuredCategories
            ? data.data.featuredCategories.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                buttonText: cat.buttonText,
                buttonLink: cat.buttonLink,
                linkType: cat.link_type,
                medusaHandle: cat.medusa_handle,
                order: cat.order,
                featured: cat.featured,
                image: cat.image ? {
                    id: cat.image?.id ?? cat.image?.[0]?.id,
                    url: prefixUrl(cat.image?.url ?? cat.image?.[0]?.url),
                    alternativeText: cat.image?.alternativeText ?? cat.image?.[0]?.alternativeText,
                    formats: cat.image?.formats ?? cat.image?.[0]?.formats
                } : null
            })).sort((a: any, b: any) => a.order - b.order)
            : []

        return {
            id: data.data.id,
            title: data.data.title,
            subtitle: data.data.subtitle,
            featuredCategories
        }
    } catch (error) {
        console.error('获取品类展示区配置失败:', error)
        return null
    }
}


// Home Collections 数据获取
export interface HomeCollectionEntry {
    id: number
    title: string
    subtitle: string
    description: string
    buttonText: string
    link_type: 'category' | 'collection' | 'product' | 'external'
    medusa_handle: string
    displayCount: number
    active: boolean
    sort_order: number
    backgroundImage: StrapiImage | null
    mobileImage: StrapiImage | null
}

export async function getHomeCollections(locale: string): Promise<HomeCollectionEntry[]> {
    try {
        const prefixUrl = (url: string) => url?.startsWith('https://') ? url : url?.startsWith('http://') ? url.replace('http://', 'https://') : `${STRAPI_BASE_URL}${url}`

        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-home-collections?populate=*&locale=${locale}&sort=sort_order:asc`,
            { next: { revalidate: 3600 } }
        )

        if (!res.ok) {
            if (res.status === 404) return []
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const json = await res.json()
        const entries = json.data

        if (!entries || !Array.isArray(entries)) return []

        return entries
            .filter((entry: any) => entry.active)
            .map((entry: any) => {
                const bgArray = entry.backgroundImage
                const bg = Array.isArray(bgArray) ? bgArray[0] : bgArray
                const mobImg = entry.mobileImage
                const mob = Array.isArray(mobImg) ? mobImg[0] : mobImg

                return {
                    id: entry.id,
                    title: entry.title,
                    subtitle: entry.subtitle,
                    description: entry.description,
                    buttonText: entry.buttonText,
                    link_type: entry.link_type,
                    medusa_handle: entry.medusa_handle,
                    displayCount: entry.displayCount || 6,
                    active: entry.active,
                    sort_order: entry.sort_order || 0,
                    backgroundImage: bg ? {
                        id: bg.id,
                        url: prefixUrl(bg.url),
                        alternativeText: bg.alternativeText,
                        formats: bg.formats
                    } : null,
                    mobileImage: mob ? {
                        id: mob.id,
                        url: prefixUrl(mob.url),
                        alternativeText: mob.alternativeText,
                        formats: mob.formats
                    } : null
                }
            })
    } catch (error) {
        console.error('获取Home Collections失败:', error)
        return []
    }
}




export async function getFooterSetting(locale: string) {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-footer?populate[nav_columns][populate][links][populate]=*&populate[value_props][populate]=*&populate[payment_icons][populate]=*&locale=${locale}`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            console.error(`HTTP错误! 状态: ${res.status}`);
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        return json.data;
    } catch (error) {
        console.error('获取底栏配置失败:', error);
        return null;
    }
}


export async function getLilaPageBySlug(slug: string, locale: string) {
    try {
        const url = `${STRAPI_BASE_URL}/api/lila-pages?filters[slug][$eq]=${slug}&locale=${locale}&populate=*`;

        const res = await fetch(url, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();

        // 返回数组中的第一条匹配项
        return json.data?.[0] || null;
    } catch (error) {
        console.error('获取页面内容失败:', error);
        return null;
    }
}





// 类型定义
type StrapiMedia = {
    id: number;
    name: string;
    url: string;
    alternativeText?: string;
    formats?: {
        thumbnail?: { url: string };
        small?: { url: string };
        medium?: { url: string };
        large?: { url: string };
    };
};

type SocialMediaLink = {
    id: number;
    platform: string;
    url: string;
    sortOrder: number;
    medialogo: StrapiMedia[] | null;
};

type FooterBottomSettings = {
    id: number;
    copyrightText: string;
    paymentIcons: StrapiMedia[];
    socialMediaLinks: SocialMediaLink[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
};

export async function getFooterBottomSettings(): Promise<FooterBottomSettings | null> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/footer-bottom-setting?populate[socialMediaLinks][populate][medialogo][populate]=*&populate[paymentIcons][populate]=*&locale=en-US`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            console.error(`获取底部配置失败: ${res.status} ${res.statusText}`);
            return null;
        }

        const { data } = await res.json();

        const prefixUrl = (url: string) => url?.startsWith('https://') ? url : url?.startsWith('http://') ? url.replace('http://', 'https://') : `${STRAPI_BASE_URL}${url}`

        // 数据转换处理
        const processedData = {
            ...data,
            paymentIcons: data.paymentIcons?.map((icon: any) => ({
                ...icon,
                url: prefixUrl(icon.url)
            })) || [],
            // 确保socialMediaLinks中的medialogo是数组格式
            socialMediaLinks: data.socialMediaLinks?.map((link: any) => ({
                ...link,
                medialogo: (link.medialogo || []).map((logo: any) => ({
                    ...logo,
                    url: prefixUrl(logo.url)
                }))
            })) || []
        };

        return processedData;
    } catch (error) {
        console.error('获取底部配置失败:', error);
        return null;
    }
}