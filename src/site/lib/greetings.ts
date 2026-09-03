export type Greeting = {
    /** Hello in the local script. */
    hello: string
    /** Roman transliteration, for anyone who cannot read the script. */
    helloRoman: string
    /** "Come along / let's go" in the local script. */
    comeAlong: string
    comeAlongRoman: string
    /** Thank you in the local script. */
    thanks: string
    thanksRoman: string
    /** Language name, shown to the visitor. */
    language: string
    /** BCP-47 tag so screen readers pronounce the script correctly. */
    lang: string
}

const TELUGU: Greeting = {
    hello: 'నమస్కారం',
    helloRoman: 'Namaskāram',
    comeAlong: 'పదండి',
    comeAlongRoman: 'padandi',
    thanks: 'ధన్యవాదాలు',
    thanksRoman: 'Dhanyavādālu',
    language: 'Telugu',
    lang: 'te',
}

const HINDI: Greeting = {
    hello: 'नमस्ते',
    helloRoman: 'Namaste',
    comeAlong: 'चलिए',
    comeAlongRoman: 'chaliye',
    thanks: 'धन्यवाद',
    thanksRoman: 'Dhanyavād',
    language: 'Hindi',
    lang: 'hi',
}

const TAMIL: Greeting = {
    hello: 'வணக்கம்',
    helloRoman: 'Vaṇakkam',
    comeAlong: 'வாங்க',
    comeAlongRoman: 'vaanga',
    thanks: 'நன்றி',
    thanksRoman: 'Naṇri',
    language: 'Tamil',
    lang: 'ta',
}

const KANNADA: Greeting = {
    hello: 'ನಮಸ್ಕಾರ',
    helloRoman: 'Namaskāra',
    comeAlong: 'ಬನ್ನಿ',
    comeAlongRoman: 'banni',
    thanks: 'ಧನ್ಯವಾದ',
    thanksRoman: 'Dhanyavāda',
    language: 'Kannada',
    lang: 'kn',
}

const MALAYALAM: Greeting = {
    hello: 'നമസ്കാരം',
    helloRoman: 'Namaskāram',
    comeAlong: 'വരൂ',
    comeAlongRoman: 'varū',
    thanks: 'നന്ദി',
    thanksRoman: 'Nandi',
    language: 'Malayalam',
    lang: 'ml',
}

const MARATHI: Greeting = {
    hello: 'नमस्कार',
    helloRoman: 'Namaskār',
    comeAlong: 'चला',
    comeAlongRoman: 'chala',
    thanks: 'धन्यवाद',
    thanksRoman: 'Dhanyavād',
    language: 'Marathi',
    lang: 'mr',
}

const BENGALI: Greeting = {
    hello: 'নমস্কার',
    helloRoman: 'Nomoskar',
    comeAlong: 'চলুন',
    comeAlongRoman: 'cholun',
    thanks: 'ধন্যবাদ',
    thanksRoman: 'Dhonnobad',
    language: 'Bengali',
    lang: 'bn',
}

const GUJARATI: Greeting = {
    hello: 'નમસ્તે',
    helloRoman: 'Namaste',
    comeAlong: 'ચાલો',
    comeAlongRoman: 'chaalo',
    thanks: 'આભાર',
    thanksRoman: 'Aabhār',
    language: 'Gujarati',
    lang: 'gu',
}

const PUNJABI: Greeting = {
    hello: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    helloRoman: 'Sat Srī Akāl',
    comeAlong: 'ਆਓ',
    comeAlongRoman: 'aao',
    thanks: 'ਧੰਨਵਾਦ',
    thanksRoman: 'Dhanvād',
    language: 'Punjabi',
    lang: 'pa',
}

const ODIA: Greeting = {
    hello: 'ନମସ୍କାର',
    helloRoman: 'Namaskāra',
    comeAlong: 'ଆସନ୍ତୁ',
    comeAlongRoman: 'aasantu',
    thanks: 'ଧନ୍ୟବାଦ',
    thanksRoman: 'Dhanyabād',
    language: 'Odia',
    lang: 'or',
}

const ASSAMESE: Greeting = {
    hello: 'নমস্কাৰ',
    helloRoman: 'Nomoskar',
    comeAlong: 'আহক',
    comeAlongRoman: 'aahok',
    thanks: 'ধন্যবাদ',
    thanksRoman: 'Dhonnobad',
    language: 'Assamese',
    lang: 'as',
}

const RAJASTHANI: Greeting = {
    hello: 'खम्मा घणी',
    helloRoman: 'Khamma Ghaṇī',
    comeAlong: 'चालो',
    comeAlongRoman: 'chaalo',
    thanks: 'धन्यवाद',
    thanksRoman: 'Dhanyavād',
    language: 'Rajasthani',
    lang: 'hi',
}

const ENGLISH: Greeting = {
    hello: 'Hello',
    helloRoman: 'Hello',
    comeAlong: 'come along',
    comeAlongRoman: 'come along',
    thanks: 'Thank you',
    thanksRoman: 'Thank you',
    language: 'English',
    lang: 'en',
}

const BY_STATE: Record<string, Greeting> = {
    'andhra pradesh': TELUGU,
    telangana: TELUGU,
    'tamil nadu': TAMIL,
    puducherry: TAMIL,
    karnataka: KANNADA,
    kerala: MALAYALAM,
    lakshadweep: MALAYALAM,
    maharashtra: MARATHI,
    goa: MARATHI,
    'west bengal': BENGALI,
    tripura: BENGALI,
    gujarat: GUJARATI,
    'dadra and nagar haveli and daman and diu': GUJARATI,
    punjab: PUNJABI,
    chandigarh: PUNJABI,
    odisha: ODIA,
    assam: ASSAMESE,
    rajasthan: RAJASTHANI,
}

/** A sampler for the homepage, before we know where the visitor is. */
export const SHOWCASE_GREETINGS: Greeting[] = [
    TELUGU,
    HINDI,
    TAMIL,
    KANNADA,
    MALAYALAM,
    MARATHI,
    BENGALI,
]

/**
 * Picks the greeting a local would actually use, based on the city's state.
 * Falls back to Hindi elsewhere in India, and English outside it.
 */
export function greetingForPlace(state: string | null, country: string | null): Greeting {
    const key = (state ?? '').trim().toLowerCase()
    if (key && BY_STATE[key]) return BY_STATE[key]

    const land = (country ?? '').trim().toLowerCase()
    if (land === 'india' || land === 'bharat' || land === 'in') return HINDI

    return ENGLISH
}
