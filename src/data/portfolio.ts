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

export interface VideoSection {
  title: string
  description?: string
  role?: string
  credits?: Credit[]
  videos: BunnyVideo[]
  galleries?: ImageGallery[]
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
  /** All videos in this project (flat list for simple projects) */
  videos: BunnyVideo[]
  /** Grouped sub-sections for multi-campaign projects (overrides flat videos) */
  sections?: VideoSection[]
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

/** Get the primary aspect ratio for a portfolio item's card display */
export function getCardAspectRatio(item: PortfolioItem): string {
  if (item.type === "single") {
    return item.video.aspectRatio || "16/9"
  }
  // For projects with sections, use first section's first video
  if (item.sections && item.sections.length > 0) {
    const firstVideo = item.sections[0].videos[0]
    if (firstVideo) return firstVideo.aspectRatio || "16/9"
  }
  // For flat video projects, use first video
  if (item.videos.length > 0) {
    return item.videos[0].aspectRatio || "16/9"
  }
  return "16/9"
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: "wynn-nightlife",
    type: "project",
    title: "Wynn Nightlife",
    client: "Wynn Nightlife",
    description:
      "Our favorite work from an ongoing partnership.",
    role: "Editors",
    categories: ["Featured", "Nightlife"],
    featured: true,
    order: 1,
    customThumbnail: "/gallery/wynn-resi.png",
    thumbnailVideoId: "ba823cf7-8001-4ed9-bf4b-ba292ab1c4e4",
    videos: [
      {
        videoId: "ba823cf7-8001-4ed9-bf4b-ba292ab1c4e4",
        title: "The Year of Excess — Wynn Resi Video 2026",
        aspectRatio: "16/9",
      },
      {
        videoId: "e4a21908-ba2c-45a4-b1fc-f635106858af",
        title: "Dustin Lynch Residency Announcement 2025",
        aspectRatio: "9/16",
      },
      {
        videoId: "f4763702-d4f9-420c-92ff-ae5a12d1928b",
        title: "EDC Week at the Wynn 2025",
        aspectRatio: "16/9",
      },
      {
        videoId: "6bfa6fe2-0801-4a6f-9e34-65b9e8086e3c",
        title: "Sofi Tukker Residency Announcement 2026",
        aspectRatio: "5/4",
      },
      {
        videoId: "dc492476-9c8b-4b11-ac72-1916898228d7",
        title: "Hugel — \"Hugel Service\" Residency Announcement 2026",
        aspectRatio: "5/4",
      },
    ],
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
    order: 4,
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
    order: 5,
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
    order: 6.5,
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
    order: 6,
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
    order: 8.5,
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
    order: 9,
    customThumbnail: "/gallery/searching.png",
    video: {
      videoId: "55972f42-12e0-4b76-9354-c59ecc7c3045",
      title: "Searching…",
      aspectRatio: "4/3",
    },
  },
  {
    id: "la-hike",
    type: "single",
    title: "LA Hike",
    description: "A fun one from our time in LA",
    role: "Shot and Edited",
    categories: ["Travel"],
    featured: false,
    order: 10,
    customThumbnail: "/gallery/lasign.jpg",
    video: {
      videoId: "ff8acedc-de95-46c5-9fb9-b3a25cd96e2f",
      title: "LA Hike",
      aspectRatio: "4/3",
    },
  },
  {
    id: "prizepicks",
    type: "project",
    title: "Prize Picks",
    client: "Prize Picks",
    description: "Ongoing partnership delivering social content across multiple campaigns.",
    categories: ["Branded & Social"],
    featured: false,
    order: 3,
    thumbnailVideoId: "c6550516-289e-4763-b91b-c15fcb56c011",
    customThumbnail: "/gallery/pp-still.png",
    videos: [],
    sections: [
      {
        title: "Its Good To Be Right NFL 25'",
        description: "40+ Assets delivered across social",
        role: "Virtual Editors",
        credits: [
          { label: "Director", value: "Alexandra Gavillet" },
          { label: "DP", value: "Tamara Santos" },
          { label: "Agency", value: "Preacher" },
          { label: "Production", value: "Yadayada Studio" },
          { label: "Producer", value: "Gabe Figueroa" },
          { label: "Editors", value: "Duddcash" },
          { label: "2nd AC / DIT", value: "@caroliscolombo" },
          { label: "Production Assistant", value: "@janeh.kim" },
          { label: "Production Assistant", value: "@henryalexkelly" },
        ],
        videos: [
          {
            videoId: "c6550516-289e-4763-b91b-c15fcb56c011",
            title: "Clutch Gene",
            aspectRatio: "9/16",
          },
          {
            videoId: "3db203fb-120c-4744-9cbf-ce7f527f73b0",
            title: "Gym Simple Gameplay",
            aspectRatio: "9/16",
          },
          {
            videoId: "78e82815-b53e-410f-ad37-307619097416",
            title: "Bookstore Fast Withdrawls",
            aspectRatio: "9/16",
          },
          {
            videoId: "1cc59d5b-7492-46ad-88f0-c03eeb1b1e2b",
            title: "Gym Availability",
            aspectRatio: "9/16",
          },
          {
            videoId: "288aaf48-f631-4544-bf41-560e628935a2",
            title: "Hot Tub $50 Offer",
            aspectRatio: "9/16",
          },
          {
            videoId: "f2677e91-249c-427d-91cf-9e1ea3328db0",
            title: "My Line-up Hit",
            aspectRatio: "9/16",
          },
          {
            videoId: "d8d512c1-8d72-42b9-a054-3bfd7e2e6db1",
            title: "Gym $50 Offer",
            aspectRatio: "9/16",
          },
        ],
      },
      {
        title: "NBA 25'",
        description:
          "With a star studded line-up featuring Allen Iverson, Sam Richardson, Candace Parker, and Druski, Prize Picks rolls out an all new social campaign. Pairing one NBA player with one comedian, each asset has its fair share of laughs and product placement.",
        role: "Virtual Editors",
        videos: [
          {
            videoId: "962bcc9e-c79e-489c-ac50-502646bebbd3",
            title: "Step Over",
            aspectRatio: "9/16",
          },
          {
            videoId: "6f44fb2d-6ba5-450d-af35-f3bcdd74fc7f",
            title: "Blooper Reel: Candace x Druski",
            aspectRatio: "9/16",
          },
          {
            videoId: "96fefb77-a428-4a62-8151-246fae13b965",
            title: "Predictions Candace",
            aspectRatio: "9/16",
          },
          {
            videoId: "350ae4f2-e1d0-485e-9f01-0ea471bb17c4",
            title: "99.9% Accuracy: AI x Sam",
            aspectRatio: "9/16",
          },
          {
            videoId: "f4aad7dc-014e-4910-8a8c-4e72e290cd08",
            title: "Pop a Shot Candace x Druski",
            aspectRatio: "9/16",
          },
          {
            videoId: "b451f2ae-412b-4177-af56-a503ad0fa1c4",
            title: "BTS: AI x Sam",
            aspectRatio: "9/16",
          },
        ],
      },
      {
        title: "NFL Playoffs 25'",
        description: "Back just in time for the NFL playoffs, with a new batch of 40+ assets across social",
        role: "Virtual Editors",
        credits: [
          { label: "Director", value: "Henry Alexander Kelly" },
          { label: "DP", value: "Rafael Gomez" },
          { label: "Agency", value: "Preacher" },
          { label: "Producer", value: "Gabe Figueroa" },
          { label: "Editors", value: "Duddcash" },
          { label: "Assistant Director", value: "Billy Jones" },
          { label: "Sound Mixer", value: "Spencer Flynn" },
          { label: "B Camera Operator", value: "Joseph Warner" },
          { label: "Utility Manager", value: "Mauricio Cimino" },
          { label: "Production Assistant", value: "Jane Kim" },
        ],
        videos: [
          {
            videoId: "b516cc92-38c8-40fe-8f90-9c9f17991bc0",
            title: "Arm Chair Coach",
            aspectRatio: "9/16",
          },
          {
            videoId: "b93ce324-0082-42e3-a41e-691c0956411e",
            title: "Drop Everything",
            aspectRatio: "9/16",
          },
          {
            videoId: "d72608f8-0b64-40e0-b3b1-cf740ff1f56c",
            title: "The Offer",
            aspectRatio: "9/16",
          },
          {
            videoId: "dbe4596c-b5c2-4097-b32f-e882c97a264c",
            title: "Side Kick",
            aspectRatio: "9/16",
          },
          {
            videoId: "9acbe8e4-ef99-472f-a706-9462abf32689",
            title: "Security Guard",
            aspectRatio: "9/16",
          },
        ],
      },
    ],
  },
  {
    id: "chipotle-behind-the-line",
    type: "single",
    title: "Chipotle Presents… Behind the Line",
    client: "Chipotle",
    description:
      "New York Knicks stars Josh Hart and Mikal Bridges join forces to prepare and create their own personal Chipotle staples.",
    role: "Virtual Editors",
    credits: [
      { label: "Client", value: "Chipotle" },
      { label: "Producer", value: "Jeanette Bonner" },
      { label: "Production", value: "Yadayada Studio" },
      { label: "Cam Op", value: "Matt Chirico" },
      { label: "Cam Op", value: "Chris Chu" },
      { label: "Sound", value: "Rob Ellenberg" },
      { label: "Editors", value: "Duddcash" },
      { label: "PA", value: "Catriona Rubenis-Stevens" },
      { label: "PA", value: "Grant Moyer" },
    ],
    categories: ["Branded & Social"],
    featured: false,
    order: 5.5,
    customThumbnail: "/gallery/chipotle.png",
    video: {
      videoId: "44a352f6-ec7b-4050-b2ca-2a89d278504b",
      title: "Chipotle Presents… Behind the Line",
      aspectRatio: "9/16",
    },
  },
  // ── Nightlife ──────────────────────────────────────────────────
  {
    id: "fwd-hospitality",
    type: "project",
    title: "FWD Hospitality Group",
    client: "FWD Hospitality Group",
    description: "Our best work from an ongoing partnership.",
    role: "Shooters, Editors",
    credits: [
      { label: "Shooters", value: "Gabriel Delgado, Logan Murray, Nate Stuck, Tyler Ferg, Benjamin Gugick, Duddcash" },
      { label: "VFX", value: "Jayden" },
      { label: "Editors", value: "Duddcash, Benjamin Gugick" },
    ],
    categories: ["Nightlife"],
    featured: false,
    order: 1.1,
    thumbnailVideoId: "237b00c3-15e9-4116-b108-72820698c933",
    videos: [
      {
        videoId: "237b00c3-15e9-4116-b108-72820698c933",
        title: "Shaq — DJ Diesel Live @FWD Dayclub 2025",
        description:
          "Shot with Gabriel Delgado, Logan Murray, Nate Stuck, and Tyler Ferg. VFX by Jayden, edit by Duddcash.",
        aspectRatio: "4/3",
      },
      {
        videoId: "8afdb626-9fa8-4e06-9fee-24b3258c8566",
        title: "FWD Official Aftermovie 2025",
        aspectRatio: "9/16",
      },
      {
        videoId: "a62047f2-a968-4395-ab3b-ef51a7c954ce",
        title: "MGK Live @FWD Nightclub 2024",
        description:
          "Shot with Gabriel Delgado and Logan Murray. Edit by Duddcash.",
        aspectRatio: "4/5",
      },
      {
        videoId: "ba2d3784-e7c0-43f8-b0df-7f654b0f6474",
        title: "Bunt Live @FWD Nightclub 2024",
        description: "Shot and edited by Duddcash.",
        aspectRatio: "9/16",
      },
      {
        videoId: "ec198969-45f0-48e1-a960-32c016741b8d",
        title: "John Summit Live @FWD Nightclub 2023",
        description: "Shot by Duddcash, edited by Benjamin Gugick.",
        aspectRatio: "16/9",
      },
      {
        videoId: "502ed272-7864-4e98-baf3-4c59dbfc9c0b",
        title: "Welcome to the Farm Chicago — Grand Opening 2024",
        description: "Shot by Benjamin Gugick, edited by Duddcash.",
        aspectRatio: "9/16",
      },
      {
        videoId: "3f7cf58a-8126-4bcf-967a-1e093b5cbaad",
        title: "Good Night John Boy Chicago 2024",
        description: "Shot and edited by Duddcash.",
        aspectRatio: "16/9",
      },
    ],
  },
  {
    id: "thank-you-for-dancing",
    type: "project",
    title: "Thank You for Dancing",
    client: "Thank You for Dancing",
    description: "Our favorite recaps from an ongoing partnership.",
    role: "Shooters, Editors",
    categories: ["Nightlife"],
    featured: false,
    order: 1.2,
    thumbnailVideoId: "b26b54d0-1f87-4dfb-b374-c6c63d096b1f",
    videos: [
      {
        videoId: "b26b54d0-1f87-4dfb-b374-c6c63d096b1f",
        title: "Club Capri",
        description: "Hype promo for the summer Club Capri series.",
        aspectRatio: "4/3",
      },
      {
        videoId: "4a218a27-2404-4139-ba96-eaee378af7ba",
        title: "Get Lucked — St. Patty's Day 2026",
        description: "Hype promo for Get Lucked St. Patty's Day 2026.",
        aspectRatio: "4/3",
      },
    ],
  },
  {
    id: "off-limits-festival",
    type: "project",
    title: "Off Limits Festival",
    client: "Off Limits Festival",
    description:
      "Our favorite social cuts from Off Limits 2025 in Abu Dhabi.",
    role: "Editors",
    categories: ["Nightlife"],
    featured: false,
    order: 1.3,
    thumbnailVideoId: "0f37d272-e8b8-4d44-ab48-d7b15b4d6101",
    videos: [
      {
        videoId: "0f37d272-e8b8-4d44-ab48-d7b15b4d6101",
        title: "Artbat — Show Recap",
        aspectRatio: "9/16",
      },
      {
        videoId: "273844f2-fcd6-41a0-97bc-26b9a1f86660",
        title: "OneRepublic — Show Recap",
        aspectRatio: "9/16",
      },
    ],
  },
  {
    id: "jacquees-hob-cleveland",
    type: "single",
    title: "Jacquees Live at House of Blues Cleveland",
    client: "Jacquees",
    description: "Concert recap, 2023.",
    categories: ["Nightlife"],
    featured: false,
    order: 1.4,
    video: {
      videoId: "60d47d07-78b0-4707-9d0f-0b4f996d613f",
      title: "Jacquees Live at House of Blues Cleveland",
      aspectRatio: "16/9",
    },
  },
  {
    id: "chc-apres-ski",
    type: "single",
    title: "Chicago Hotel Collection — Après Ski Party",
    client: "Chicago Hotel Collection",
    description: "Après Ski Party, 2026.",
    categories: ["Nightlife"],
    featured: false,
    order: 1.5,
    video: {
      videoId: "16d8d1ab-dad1-4d8c-ba53-fddaa7bfdfa8",
      title: "Chicago Hotel Collection — Après Ski Party 2026",
      aspectRatio: "9/16",
    },
  },

  // ── Events ──────────────────────────────────────────────────────

  // Standalone singles
  {
    id: "quincy-basketball",
    type: "single",
    title: "Quincy",
    description: "",
    categories: ["Events"],
    featured: false,
    order: 11,
    video: {
      videoId: "b3237e6e-8b3a-457c-8359-1d37a8ea0662",
      title: "Quincy",
      aspectRatio: "4/3",
    },
  },
  {
    id: "final-gain",
    type: "single",
    title: "Final Gain",
    description: "",
    categories: ["Events"],
    featured: false,
    order: 12,
    video: {
      videoId: "762725e2-e1a5-44f4-b93c-94a3c12ee313",
      title: "Final Gain",
      aspectRatio: "4/5",
    },
  },
  {
    id: "rr-grammys",
    type: "single",
    title: "RR Grammys Afterparty",
    description: "",
    categories: ["Events"],
    featured: false,
    order: 13,
    video: {
      videoId: "48d993d5-b7b7-4faf-aaec-8eeee835225b",
      title: "RR Grammys Afterparty",
      aspectRatio: "9/16",
    },
  },

  // Projects
  {
    id: "reserve-cup-2025",
    type: "project",
    title: "Reserve Cup 2025",
    client: "Reserve Cup",
    description: "",
    categories: ["Events"],
    featured: false,
    order: 14,
    thumbnailVideoId: "2b348f0d-0bca-46ed-a518-a9706775e099",
    videos: [
      {
        videoId: "2b348f0d-0bca-46ed-a518-a9706775e099",
        title: "Aftermovie",
        aspectRatio: "9/16",
      },
      {
        videoId: "dc4c3253-0030-40d5-ab56-9467dc268c62",
        title: "Daily 1",
        aspectRatio: "4/5",
      },
      {
        videoId: "c3886483-70ac-4995-b22f-588762758c0c",
        title: "Daily 2",
        aspectRatio: "4/5",
      },
      {
        videoId: "a5fee1c4-69a8-4801-b1c7-2a38acd73f92",
        title: "Daily 3",
        aspectRatio: "4/5",
      },
    ],
  },
  {
    id: "wynn-f1-race-week",
    type: "project",
    title: "Wynn x F1 Race Week",
    client: "Wynn",
    description: "",
    categories: ["Events"],
    featured: false,
    order: 15,
    thumbnailVideoId: "2ecb2e2c-0e4e-4d81-b6c8-4ba0e2f9e882",
    videos: [
      {
        videoId: "2ecb2e2c-0e4e-4d81-b6c8-4ba0e2f9e882",
        title: "Aftermovie",
        aspectRatio: "9/16",
      },
      {
        videoId: "bafc174a-f89b-4e69-b9be-fa195c46bdd6",
        title: "Day 3",
        aspectRatio: "9/16",
      },
    ],
  },
  {
    id: "arnold-palmer-mastercard",
    type: "project",
    title: "Arnold Palmer Invitational x MasterCard",
    client: "MasterCard",
    description: "",
    categories: ["Events"],
    featured: false,
    order: 16,
    thumbnailVideoId: "6ca571d6-6c0b-4b33-9435-a59333041df8",
    videos: [
      {
        videoId: "6ca571d6-6c0b-4b33-9435-a59333041df8",
        title: "Director's Cut",
        aspectRatio: "4/5",
      },
      {
        videoId: "1bc5acea-1a93-4b74-8076-a64756e45a14",
        title: "Jazz",
        aspectRatio: "4/5",
      },
      {
        videoId: "16cfb3b8-cfbb-420d-9f07-a5e89481adc7",
        title: "Video 6",
        aspectRatio: "9/16",
      },
    ],
  },
]
