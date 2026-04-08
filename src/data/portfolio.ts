// Portfolio data — single source of truth for all projects and videos
// Bunny.net Stream video IDs will be filled in once videos are uploaded

export type Category =
  | "Featured"
  | "Events"
  | "Nightlife"
  | "Entertainment"
  | "Branded & Social"
  | "Spec Creative"
  | "Travel"

export interface BunnyVideo {
  /** Bunny.net Stream video GUID */
  videoId: string
  /** Human-readable title */
  title: string
  /** Optional short description */
  description?: string
  /** Aspect ratio hint for layout — defaults to "16/9" */
  aspectRatio?: string
}

export interface Credit {
  label: string
  value: string
}

export interface ImageGallery {
  title: string
  images: string[]
}

export interface PortfolioProject {
  id: string
  type: "project"
  title: string
  client: string
  description: string
  role?: string
  credits?: Credit[]
  categories: Category[]
  featured: boolean
  order: number
  /** Bunny video ID used for the card thumbnail (first video's ID) */
  thumbnailVideoId: string
  /** Optional custom thumbnail image URL (overrides Bunny auto-thumbnail) */
  customThumbnail?: string
  /** All videos in this project */
  videos: BunnyVideo[]
  /** Optional image gallery sections */
  galleries?: ImageGallery[]
}

export interface PortfolioSingle {
  id: string
  type: "single"
  title: string
  client?: string
  description?: string
  role?: string
  credits?: Credit[]
  categories: Category[]
  featured: boolean
  order: number
  /** Optional custom thumbnail image URL (overrides Bunny auto-thumbnail) */
  customThumbnail?: string
  /** The single video */
  video: BunnyVideo
  /** Optional image gallery sections */
  galleries?: ImageGallery[]
}

export type PortfolioItem = PortfolioProject | PortfolioSingle

/** All categories for filter tabs */
export const categories: ("All" | Category)[] = [
  "All",
  "Featured",
  "Events",
  "Nightlife",
  "Entertainment",
  "Branded & Social",
  "Spec Creative",
  "Travel",
]

// ─── Sample data (placeholder video IDs — replace with real Bunny.net GUIDs) ───

export const portfolioItems: PortfolioItem[] = [
  {
    id: "wynn-year-of-excess",
    type: "single",
    title: "The Year of Excess…",
    client: "Wynn Nightlife",
    description:
      "Edited a Wynn Nightlife piece, months in the making, crafted alongside Alex Schenberg and team, with footage captured by a full crew on the ground and brought together in post.",
    categories: ["Featured", "Nightlife"],
    featured: true,
    order: 1,
    customThumbnail: "/gallery/wynn-resi.png",
    video: {
      videoId: "ba823cf7-8001-4ed9-bf4b-ba292ab1c4e4",
      title: "The Year of Excess…",
      aspectRatio: "16/9",
    },
  },
  {
    id: "lululemon-yet",
    type: "project",
    title: "Lululemon Studio Yet",
    client: "Lululemon",
    description:
      "Moments from Lululemon Studio YET. Delivering 40+ assets across social.",
    role: "Cam Op, Editor",
    credits: [
      { label: "Client", value: "Lululemon" },
      { label: "Production", value: "Yadayada Studio" },
      { label: "EP", value: "Madison Clarke" },
      { label: "Producers", value: "Gabe Figueroa, Matt Sy" },
      { label: "PM", value: "Ellie Stills" },
      { label: "PA", value: "Henry Alexander Kelly" },
      { label: "Dir. Creative Ops", value: "Amy Longfellow" },
      { label: "Cam Op / Edit", value: "Duddcash" },
      { label: "Cam Op", value: "Noel Robles" },
    ],
    categories: ["Featured", "Branded & Social"],
    featured: true,
    order: 2,
    thumbnailVideoId: "71a474b4-f6b6-4c0d-a8b0-eea296c55738",
    customThumbnail: "/gallery/lulu-neon.jpg",
    videos: [
      {
        videoId: "71a474b4-f6b6-4c0d-a8b0-eea296c55738",
        title: "Best Shots",
        description: "A montage of some of our favorite shots",
        aspectRatio: "4/5",
      },
      {
        videoId: "fffcdc10-37e0-4a62-8fcb-7c5fd742bda8",
        title: "Black List Run Club",
        description: "Chasing runners through the city on a scooter at night",
        aspectRatio: "4/5",
      },
      {
        videoId: "a976ebbe-ca5a-44bb-9e70-0372ae661cc0",
        title: "Courtney Fisher",
        description: "Sunrise Pilates on the rooftop",
        aspectRatio: "4/5",
      },
      {
        videoId: "1746e92c-8549-4e9c-8d26-131c442e1adb",
        title: "Dolvett Quince",
        description: "A solid cut from the gym floor",
        aspectRatio: "4/5",
      },
      {
        videoId: "896a5e35-f9fa-47bc-95b8-e2ccc3cb9873",
        title: "BTS",
        description: "BTS from week one, made for Yadayada Studio",
        aspectRatio: "4/5",
      },
    ],
  },
  {
    id: "nike-boxing-spec",
    type: "single",
    title: "Nike Boxing — Spec Ad",
    description:
      "Over the course of 2025, we set out to conceptualize and create a piece that pushed the limits of what our small but growing team could achieve. This video stands as both a testament to what we've been building these last few years and an invaluable learning experience along the way.",
    role: "Produced, Directed, Shot and Edited",
    categories: ["Featured", "Spec Creative"],
    featured: true,
    order: 3,
    customThumbnail: "/gallery/nike-boxing.jpg",
    credits: [
      { label: "B-Cam", value: "@benjamingugick" },
      { label: "Gaffer", value: "@emmsquare" },
      { label: "Company / Rental", value: "@atlaslightingchicago" },
      { label: "Bell, Exit Sign & Green Screen VFX", value: "@jjay.creative" },
      { label: "PA's", value: "@natestuckk, @loganmurrayproductions" },
      { label: "Boxing Gym", value: "@hammerfitnessandboxing" },
      { label: "Additional Support", value: "@yadayada.studio" },
      { label: "Lead Talent (Boxer)", value: "@shotbydelli" },
      { label: "Additional Talent", value: "@joel_maisonet" },
    ],
    video: {
      videoId: "16092c79-ee7b-450e-906b-f55dcab23b9b",
      title: "Nike Boxing — Spec Ad",
      aspectRatio: "16/9",
    },
    galleries: [
      {
        title: "A curated selection of stills",
        images: [
          "/gallery/nike-boxing-stills/slide-1-.jpg",
          "/gallery/nike-boxing-stills/slide-2-.jpg",
          "/gallery/nike-boxing-stills/slide-3-.jpg",
          "/gallery/nike-boxing-stills/slide-4-.jpg",
          "/gallery/nike-boxing-stills/slide-5.jpg",
          "/gallery/nike-boxing-stills/slide-6.jpg",
          "/gallery/nike-boxing-stills/slide-7.jpg",
          "/gallery/nike-boxing-stills/slide-8.jpg",
          "/gallery/nike-boxing-stills/slide-9.jpg",
          "/gallery/nike-boxing-stills/slide-10.jpg",
          "/gallery/nike-boxing-stills/slide-11.jpg",
        ],
      },
      {
        title: "BTS",
        images: [
          "/gallery/nike-boxing-bts/bts-1.jpg",
          "/gallery/nike-boxing-bts/bts-2.jpg",
          "/gallery/nike-boxing-bts/bts-3.jpg",
          "/gallery/nike-boxing-bts/bts-4.jpg",
        ],
      },
    ],
  },
  {
    id: "academy-holiday",
    type: "project",
    title: "Academy Sports + Outdoors 2025 Holiday Campaign",
    client: "Academy Sports + Outdoors",
    description:
      "Our favorite assets from the 2025 Holiday shoot. Delivering 40+ assets across social.",
    role: "Cam Op, Editor",
    credits: [
      { label: "Client", value: "Academy Sports + Outdoors" },
      { label: "Production", value: "Yadayada Studio" },
      { label: "Producer", value: "Gabe Figueroa" },
      { label: "Director & DP", value: "Victoria Wall Harris" },
      { label: "Cam Op / Edit", value: "Duddcash, Gabriel Delgado" },
      { label: "Videography Swing", value: "Ish Holmes" },
      { label: "1st AD", value: "Jeremy Haak" },
      { label: "2nd AD", value: "John Shields" },
      { label: "Production Manager", value: "@grendel25x" },
      { label: "Production Coordinator", value: "Cameron Timmons" },
      { label: "Key PA", value: "Steve Williams" },
      { label: "Set PA", value: "@henryalexkelly, Hunter Brown, @ryan_van_getson" },
      { label: "Wardrobe Stylist", value: "Amy Tran" },
      { label: "Wardrobe Assistant", value: "@annalawsonlien, Samantha Gilmore" },
      { label: "Seamstress", value: "Michelle Heath" },
      { label: "Production Designer", value: "@texandiart" },
      { label: "Set Decorator", value: "@rmeckna" },
      { label: "Prop Master", value: "@zooworksart" },
      { label: "Swing", value: "@boscodaze" },
      { label: "Art PA", value: "Michael Witten" },
      { label: "Assistant", value: "@itsalivincent_" },
      { label: "SFX / Specialty Props", value: "@dfxfp" },
      { label: "Cast", value: "@kendra._annmarie, @tyrelljames, @bradleyrobertthomas, @katiemcmurtrie, @tgizzle12, @_m1ari, @iam.sonya, @kingpaulhoward, @_amethystt" },
    ],
    categories: ["Branded & Social"],
    featured: false,
    order: 4,
    thumbnailVideoId: "73e885fe-7c1b-49da-85d7-07ed7dd066eb",
    customThumbnail: "/gallery/academy-holiday.png",
    videos: [
      {
        videoId: "73e885fe-7c1b-49da-85d7-07ed7dd066eb",
        title: "Two Car Gym",
        aspectRatio: "9/16",
      },
      {
        videoId: "3985c640-68ad-4609-9ae7-2cdacb5c728d",
        title: "Christmas in Sport Mode",
        aspectRatio: "9/16",
      },
      {
        videoId: "2f7ec8c9-5710-40e3-942f-cf852aa5bc9d",
        title: "Everybody Every Workout",
        aspectRatio: "9/16",
      },
      {
        videoId: "413d7ee1-b3c0-455a-b167-8c82ee980e3a",
        title: "Christmas in the Bag",
        aspectRatio: "9/16",
      },
      {
        videoId: "ce871a60-de6a-4e44-96cb-5151b618a4fe",
        title: "Greatness",
        aspectRatio: "9/16",
      },
    ],
  },
  {
    id: "marine-layer-fall24",
    type: "single",
    title: "Marine Layer — Fall 2024",
    client: "Marine Layer",
    description: "Fun social BTS cut.",
    categories: ["Branded & Social"],
    featured: false,
    order: 7,
    customThumbnail: "/gallery/marine-layer.png",
    video: {
      videoId: "cfa37e9c-0e1e-48f9-9fff-2ae82a5fd91e",
      title: "Marine Layer — Fall 2024",
      description: "Fun social BTS cut",
      aspectRatio: "9/16",
    },
  },
  {
    id: "pringles-big-game",
    type: "project",
    title: "Pringles — The Big Game 2025",
    client: "Pringles",
    description:
      "Created Organic Social, Paid Social and Celeb Collab Content with over 80+ deliverables, here's a sneak peek.",
    role: "Cam Op, Editor",
    credits: [
      { label: "Director", value: "@alexandragavillet" },
      { label: "Photographer", value: "@munachiosegbu" },
      { label: "Cam Op / Editor", value: "@benjamingugick, @duddcash" },
      { label: "Producer", value: "@gabejfigueroa" },
      { label: "Prod Supervisor", value: "@kristenuno" },
      { label: "PM", value: "@photostills" },
      { label: "Prod Support", value: "@henryalexkelly" },
    ],
    categories: ["Branded & Social"],
    featured: false,
    order: 5,
    thumbnailVideoId: "e3440c87-e6da-412a-ada7-7bbad2d8e7d8",
    customThumbnail: "/gallery/pringles.png",
    videos: [
      {
        videoId: "e3440c87-e6da-412a-ada7-7bbad2d8e7d8",
        title: "Cali Style",
        aspectRatio: "9/16",
      },
      {
        videoId: "4f462b3c-f6ea-4044-86d6-7d8633d64292",
        title: "Starting Five",
        aspectRatio: "9/16",
      },
    ],
  },
  {
    id: "evian-f1-2024",
    type: "single",
    title: "Evian Water x F1 Weekend 2024",
    client: "Evian Water",
    description:
      "Short-form social piece capturing Evian's activation during F1 weekend in Las Vegas.",
    categories: ["Branded & Social"],
    featured: false,
    order: 6,
    customThumbnail: "/gallery/evian.png",
    video: {
      videoId: "b4629515-6fef-4620-a465-2227b5daf5b0",
      title: "Evian Water x F1 Weekend 2024",
      description: "Evian's activation during F1 weekend in Las Vegas",
      aspectRatio: "9/16",
    },
  },
  {
    id: "searching-spec",
    type: "single",
    title: "Searching…",
    description: "Dreams come and go but 💍 are forever",
    role: "Produced, Directed, Shot and Edited",
    categories: ["Spec Creative"],
    featured: false,
    order: 8,
    customThumbnail: "/gallery/searching.png",
    video: {
      videoId: "55972f42-12e0-4b76-9354-c59ecc7c3045",
      title: "Searching…",
      aspectRatio: "4/3",
    },
  },
  {
    id: "festival-recap",
    type: "single",
    title: "Festival Recap",
    description: "Live event coverage and crowd energy.",
    categories: ["Events", "Entertainment"],
    featured: false,
    order: 5,
    video: {
      videoId: "placeholder-fest-1",
      title: "Festival Recap 2025",
    },
  },
  {
    id: "travel-rome",
    type: "single",
    title: "Rome",
    description: "Cinematic travel film shot across Rome.",
    categories: ["Travel"],
    featured: false,
    order: 6,
    video: {
      videoId: "placeholder-rome-1",
      title: "Rome Travel Film",
    },
  },
]
