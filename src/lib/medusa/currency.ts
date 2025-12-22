/**
 * 货币符号映射表
 * 包含全球主要货币符号
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
    // 美洲
    usd: '$',      // 美元
    cad: 'C$',     // 加元
    mxn: '$',      // 墨西哥比索
    brl: 'R$',     // 巴西雷亚尔

    // 欧洲
    eur: '€',      // 欧元
    gbp: '£',      // 英镑
    chf: 'CHF',    // 瑞士法郎
    sek: 'kr',     // 瑞典克朗
    nok: 'kr',     // 挪威克朗
    dkk: 'kr',     // 丹麦克朗
    pln: 'zł',     // 波兰兹罗提
    czk: 'Kč',     // 捷克克朗
    huf: 'Ft',     // 匈牙利福林
    ron: 'lei',    // 罗马尼亚列伊
    rub: '₽',      // 俄罗斯卢布

    // 亚太
    aud: 'A$',     // 澳元
    nzd: 'NZ$',    // 新西兰元
    jpy: '¥',      // 日元
    cny: '¥',      // 人民币
    rmb: '¥',      // 人民币（别名）
    hkd: 'HK$',    // 港币
    twd: 'NT$',    // 新台币
    sgd: 'S$',     // 新加坡元
    myr: 'RM',     // 马来西亚林吉特
    thb: '฿',      // 泰铢
    idr: 'Rp',     // 印尼盾
    php: '₱',      // 菲律宾比索
    krw: '₩',      // 韩元
    inr: '₹',      // 印度卢比
    vnd: '₫',      // 越南盾

    // 中东
    aed: 'د.إ',    // 阿联酋迪拉姆
    sar: 'ر.س',    // 沙特里亚尔
    qar: 'ر.ق',    // 卡塔尔里亚尔

    // 非洲
    zar: 'R',      // 南非兰特
    egp: 'E£',     // 埃及镑
    kes: 'KSh',    // 肯尼亚先令
}

/**
 * 货币小数位数配置
 * 大多数货币：2位小数
 * 部分货币：0位小数（日元、韩元等）
 * 特殊情况：3位小数（巴林第纳尔等）
 */
const CURRENCY_DECIMALS: Record<string, number> = {
    jpy: 0,  // 日元
    krw: 0,  // 韩元
    vnd: 0,  // 越南盾
    idr: 0,  // 印尼盾
    twd: 0,  // 新台币（通常显示整数）
    inr: 0,  // 印度卢比（通常显示整数）
    bhd: 3,  // 巴林第纳尔
    jod: 3,  // 约旦第纳尔
    kwd: 3,  // 科威特第纳尔
    omr: 3,  // 阿曼里亚尔
    lyd: 3,  // 利比亚第纳尔
}

/**
 * 货币显示名称（英文）
 */
const CURRENCY_NAMES: Record<string, string> = {
    usd: 'US Dollar',
    eur: 'Euro',
    gbp: 'British Pound',
    jpy: 'Japanese Yen',
    cny: 'Chinese Yuan',
    aud: 'Australian Dollar',
    cad: 'Canadian Dollar',
    chf: 'Swiss Franc',
}

/**
 * 获取货币符号
 * @param currencyCode 货币代码（如 'usd', 'eur', 'cny'）
 * @returns 货币符号，如 '$', '€', '¥'
 */
export function getCurrencySymbol(currencyCode: string): string {
    if (!currencyCode) return '$'

    const code = currencyCode.toLowerCase()
    return CURRENCY_SYMBOLS[code] || currencyCode.toUpperCase()
}

/**
 * 获取货币显示名称
 * @param currencyCode 货币代码
 * @returns 货币名称
 */
export function getCurrencyName(currencyCode: string): string {
    if (!currencyCode) return 'US Dollar'

    const code = currencyCode.toLowerCase()
    return CURRENCY_NAMES[code] || currencyCode.toUpperCase()
}

/**
 * 获取货币小数位数
 * @param currencyCode 货币代码
 * @returns 应显示的小数位数
 */
export function getCurrencyDecimals(currencyCode: string): number {
    if (!currencyCode) return 2

    const code = currencyCode.toLowerCase()
    return CURRENCY_DECIMALS[code] ?? 2
}

/**
 * 格式化价格（电商简洁版）
 * @param amount 金额（以分为单位）
 * @param currencyCode 货币代码
 * @returns 格式化后的价格字符串，如 "$19.99", "¥399", "€29"
 */
export function formatPrice(amount: number, currencyCode: string): string {
    if (amount === null || amount === undefined) {
        return '价格待定'
    }

    const symbol = getCurrencySymbol(currencyCode)
    const decimals = getCurrencyDecimals(currencyCode)

    // 转换为基本单位（分转元/美元等）
    const baseAmount = amount / 100

    // 格式化数字
    let formattedNumber: string

    if (decimals === 0) {
        // 整数显示
        formattedNumber = Math.round(baseAmount).toString()
    } else {
        // 小数显示
        const factor = Math.pow(10, decimals)
        const rounded = Math.round(baseAmount * factor) / factor
        formattedNumber = rounded.toFixed(decimals)

        // 去除尾随的零
        if (decimals > 0) {
            formattedNumber = formattedNumber.replace(/\.?0+$/, '')
        }
    }

    // 添加千位分隔符（对于大额数字）
    if (formattedNumber.length > 4 && !formattedNumber.includes('.')) {
        formattedNumber = addThousandSeparator(formattedNumber)
    }

    return `${symbol}${formattedNumber}`
}

/**
 * 添加千位分隔符
 */
function addThousandSeparator(numStr: string): string {
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 从价格对象格式化价格（适配Medusa价格结构）
 * @param priceObject 价格对象，包含 calculated_price_number 和 currency_code
 * @returns 格式化后的价格字符串
 */
export function formatPriceFromObject(priceObject?: {
    calculated_price_number?: number
    currency_code?: string
}): string {
    if (!priceObject ||
        priceObject.calculated_price_number === undefined ||
        priceObject.calculated_price_number === null) {
        return '价格待定'
    }

    return formatPrice(
        priceObject.calculated_price_number,
        priceObject.currency_code || 'usd'
    )
}

/**
 * 获取原始价格和折扣价格（用于显示原价和现价）
 * @param variant 商品变体
 * @returns 包含原价和现价的对象
 */
export function getPriceComparison(variant: any): {
    originalPrice: string
    salePrice: string | null
    hasDiscount: boolean
    discountPercentage: number
} {
    if (!variant?.calculated_price) {
        return {
            originalPrice: '价格待定',
            salePrice: null,
            hasDiscount: false,
            discountPercentage: 0
        }
    }

    const { calculated_amount, original_amount, currency_code } = variant.calculated_price

    const currentPrice = calculated_amount
    const originalPrice = original_amount || calculated_amount

    const hasDiscount = originalPrice > currentPrice
    const discountPercentage = hasDiscount
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0

    return {
        originalPrice: formatPrice(originalPrice, currency_code),
        salePrice: hasDiscount ? formatPrice(currentPrice, currency_code) : null,
        hasDiscount,
        discountPercentage
    }
}

/**
 * 货币代码是否有效
 */
export function isValidCurrencyCode(currencyCode: string): boolean {
    if (!currencyCode) return false
    return currencyCode.toLowerCase() in CURRENCY_SYMBOLS
}

/**
 * 获取支持的货币列表
 */
export function getSupportedCurrencies(): Array<{
    code: string
    symbol: string
    name: string
    decimals: number
}> {
    return Object.keys(CURRENCY_SYMBOLS).map(code => ({
        code: code.toUpperCase(),
        symbol: CURRENCY_SYMBOLS[code],
        name: CURRENCY_NAMES[code] || code.toUpperCase(),
        decimals: CURRENCY_DECIMALS[code] ?? 2
    }))
}