import {
    BedDouble,
    Building2,
    Castle,
    Compass,
    Droplets,
    Flower2,
    Landmark,
    Leaf,
    MapPin,
    Mountain,
    PawPrint,
    ShoppingBag,
    Tent,
    Trees,
    UtensilsCrossed,
    type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
    PARK: Trees,
    GARDEN: Flower2,
    RELIGIOUS_PLACE: Landmark,
    WATERFALL: Droplets,
    VIEWPOINT: Mountain,
    LAKE_AND_DAM: Droplets,
    MUSEUM: Building2,
    HISTORICAL_PLACE: Castle,
    WILDLIFE: PawPrint,
    ADVENTURE: Tent,
    MARKET: ShoppingBag,
    TEA_PLANTATION: Leaf,
    RESTAURANT: UtensilsCrossed,
    HOTEL: BedDouble,
}

export function categoryIcon(code: string): LucideIcon {
    return ICONS[code] ?? Compass
}

export { MapPin }
