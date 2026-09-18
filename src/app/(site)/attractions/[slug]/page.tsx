import { redirect } from 'next/navigation'

// Legacy CMS URLs no longer resolve master records into public content.
export default function Page() { redirect('/attractions') }
