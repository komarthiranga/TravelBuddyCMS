/** Stable visual identities for generic illustrations; real venue photos win. */
export function categoryArtwork(category: string, name = '') {
    const text = `${category} ${name}`.toLowerCase()
    if (/temple|devasthan|swamy|shivalayam/.test(text)) return 'temple'
    if (/restaurant|cafe|food|quick bites|market/.test(text)) return 'food'
    if (/hotel|stay|guest house/.test(text)) return 'stay'
    if (/park|garden|lake|waterfall|wildlife|viewpoint|tea plantation|adventure/.test(text)) return 'nature'
    if (/museum|historical|heritage/.test(text)) return 'culture'
    return 'explore'
}
const variants: Record<string, string[]> = {
    food: ['food', 'food-biryani', 'food-thali', 'food-cafe'],
    temple: ['temple', 'temple-courtyard', 'temple-evening'],
}
// Keep the current collection visually distinct even when cards sit together.
const assigned: Record<string, string> = {
    'siva grand': 'food-thali', 'vihari robo restaurant': 'food-biryani',
    'grand aryas food court': 'food', 'punnami family restaurant': 'food-thali',
    'navayuga fast foods': 'food-cafe', 'milk n more (eluru)': 'food-cafe',
    'hospital canteen': 'food-thali', 'u.s.pizza.co': 'food-cafe',
    'dasanjaneya swamy temple': 'temple-courtyard',
    'sri sri sri kanakamahalakshmi devasthanam': 'temple-evening',
    'shivalayam , vatluru': 'temple', 'maha lakshmi devi temple': 'temple-courtyard',
    'sai baba temple': 'temple-evening',
}
export function illustrationSource(category: string, name: string) {
    const key = name.trim().toLowerCase()
    const family = categoryArtwork(category, name)
    const options = variants[family] ?? [family]
    let hash = 0
    for (const character of key) hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0
    return `/images/categories/${assigned[key] ?? options[hash % options.length]}.webp`
}
export function isCategoryIllustration(src?: string | null, alt?: string | null) {
    return !src?.trim() || src.includes('/travel-buddy/ai-category-defaults/') || src.startsWith('/images/categories/') || Boolean(alt?.startsWith('AI-generated '))
}
export function resolvePlaceImage(src: string | null | undefined, alt: string | null | undefined, category: string, name: string) {
    return isCategoryIllustration(src, alt) ? illustrationSource(category, name) : src!.trim()
}
