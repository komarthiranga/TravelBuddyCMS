import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: '/', name: 'Travel Buddy', short_name: 'Travel Buddy',
        description: 'Your local friend for places, visiting tips and directions.',
        start_url: '/', scope: '/', display: 'standalone',
        background_color: '#ffffff', theme_color: '#155e57',
        icons: [
            {src:'/pwa/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
            {src:'/pwa/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
            {src:'/pwa/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'},
        ],
        shortcuts: [{name:'Explore places',url:'/attractions'},{name:'Plan a visit',url:'/guide'}],
    }
}
