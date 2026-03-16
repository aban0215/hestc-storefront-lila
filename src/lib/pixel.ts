export const fbEvent = (eventName: string, options = {}) => {
    if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", eventName, options)
    }
}