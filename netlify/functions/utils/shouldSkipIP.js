export function shouldSkipIP(ip) {
    if(!ip) return true;

    const skipIPList = (process.env.SKIP_TRACKING_IPS || "").split(",").map(ip => ip.trim());
    return skipIPList.includes(ip);
}