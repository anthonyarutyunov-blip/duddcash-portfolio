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
  | "Culinary"

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
  "Culinary",
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
    client: "2024-Present",
    description: "Our favorite work from an ongoing partnership.",
    role: "Editors",
    categories: ["Featured", "Nightlife"],
    featured: true,
    order: 1,
    customThumbnail: "/gallery/wynn-resi.png",
    thumbnailVideoId: "ba823cf7-8001-4ed9-bf4b-ba292ab1c4e4",
    videos: [
      {
        videoId: "ba823cf7-8001-4ed9-bf4b-ba292ab1c4e4",
        title: "The Year of Excess — Wynn Residency Video 2026",
        aspectRatio: "16/9",
      },
      {
        videoId: "dc492476-9c8b-4b11-ac72-1916898228d7",
        title: "Hugel — \"Hugel Service\" Residency Announcement 2026",
        aspectRatio: "5/4",
      },
      {
        videoId: "6bfa6fe2-0801-4a6f-9e34-65b9e8086e3c",
        title: "Sofi Tukker Residency Announcement 2026",
        aspectRatio: "5/4",
      },
      {
        videoId: "e4a21908-ba2c-45a4-b1fc-f635106858af",
        title: "Dustin Lynch Residency 2025",
        aspectRatio: "9/16",
      },
      {
        videoId: "e83c2899-901b-4b9a-9d14-1d8294af59dc",
        title: "Hugel Residency 2025",
        aspectRatio: "9/16",
      },
      {
        videoId: "fc941756-f5e9-4f44-a151-8bc5a00e2d10",
        title: "Memorial Day Weekend at the Wynn 2025",
        aspectRatio: "16/9",
      },
      {
        videoId: "f4763702-d4f9-420c-92ff-ae5a12d1928b",
        title: "EDC Week at the Wynn 2025",
        aspectRatio: "16/9",
      },
      {
        videoId: "c9ecf521-73f8-47ee-8715-6f335269ac9b",
        title: "Hidden in Plain Sight 2025",
        aspectRatio: "4/5",
      },
      {
        videoId: "5a92afe6-e60e-4cc0-beb0-5f4035f8e92e",
        title: "Mau P Live @XS 2025",
        aspectRatio: "4/5",
      },
    ],
  },
  {
    id: "lululemon-yet",
    type: "project",
    title: "Lululemon Studio Yet",
    client: "Lululemon",
    description: "Moments from Lululemon Studio YET. Delivering 40+ assets across social.",
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
    customThumbnail: "/gallery/lulu-neon.jpg",
    thumbnailVideoId: "71a474b4-f6b6-4c0d-a8b0-eea296c55738",
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
    description: "Over the course of 2025, we set out to conceptualize and create a piece that pushed the limits of what our small but growing team could achieve. This video stands as both a testament to what we've been building these last few years and an invaluable learning experience along the way.",
    role: "Produced, Directed, Shot and Edited",
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
    categories: ["Featured", "Spec Creative"],
    featured: true,
    order: 4,
    customThumbnail: "/gallery/nike-boxing.jpg",
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
    description: "Our favorite assets from the 2025 Holiday shoot. Delivering 40+ assets across social.",
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
    customThumbnail: "/gallery/academy-holiday.png",
    thumbnailVideoId: "73e885fe-7c1b-49da-85d7-07ed7dd066eb",
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
    description: "Created Organic Social, Paid Social and Celeb Collab Content with over 80+ deliverables, here's a sneak peek.",
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
    customThumbnail: "/gallery/pringles.png",
    thumbnailVideoId: "e3440c87-e6da-412a-ada7-7bbad2d8e7d8",
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
    description: "Short-form social piece capturing Evian's activation during F1 weekend in Las Vegas.",
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
    customThumbnail: "/gallery/thumbnails/searching-spec.jpg",
    video: {
      videoId: "55972f42-12e0-4b76-9354-c59ecc7c3045",
      title: "Searching…",
      aspectRatio: "4/3",
    },
  },
  {
    id: "la-hike",
    type: "single",
    title: "West Coast Perspectives",
    description: "",
    role: "Shot and Edited",
    categories: ["Travel"],
    featured: false,
    order: 10,
    customThumbnail: "/gallery/lasign.jpg",
    video: {
      videoId: "ff8acedc-de95-46c5-9fb9-b3a25cd96e2f",
      title: "",
      aspectRatio: "4/3",
    },
  },
  {
    id: "prizepicks",
    type: "project",
    title: "Prize Picks",
    client: "2025-Present",
    description: "Ongoing partnership delivering social content across multiple campaigns.",
    categories: ["Branded & Social"],
    featured: false,
    order: 3,
    customThumbnail: "/gallery/pp-still.png",
    thumbnailVideoId: "c6550516-289e-4763-b91b-c15fcb56c011",
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
        description: "With a star studded line-up featuring Allen Iverson, Sam Richardson, Candace Parker, and Druski, Prize Picks rolls out an all new social campaign. Pairing one NBA player with one comedian, each asset has its fair share of laughs and product placement.",
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
    description: "New York Knicks stars Josh Hart and Mikal Bridges join forces to prepare and create their own personal Chipotle staples.",
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
  {
    id: "fwd-hospitality",
    type: "project",
    title: "FWD Hospitality Group",
    client: "2023-Present",
    description: "Our best work from an ongoing partnership.",
    categories: ["Featured", "Nightlife"],
    featured: true,
    order: 1.1,
    customThumbnail: "/gallery/thumbnails/fwd-hospitality.jpg",
    thumbnailVideoId: "237b00c3-15e9-4116-b108-72820698c933",
    videos: [
      {
        videoId: "a62047f2-a968-4395-ab3b-ef51a7c954ce",
        title: "MGK Live @FWD Nightclub 2024",
        description: "Shot with Gabriel Delgado and Logan Murray. Edit by Duddcash.",
        aspectRatio: "4/5",
      },
      {
        videoId: "237b00c3-15e9-4116-b108-72820698c933",
        title: "Shaq — DJ Diesel Live @FWD Dayclub 2025",
        description: "Shot with Gabriel Delgado, Logan Murray, Nate Stuck, and Tyler Ferg. VFX by Jayden, edit by Duddcash.",
        aspectRatio: "4/3",
      },
      {
        videoId: "8afdb626-9fa8-4e06-9fee-24b3258c8566",
        title: "FWD Official Aftermovie 2025",
        aspectRatio: "9/16",
      },
      {
        videoId: "ba2d3784-e7c0-43f8-b0df-7f654b0f6474",
        title: "Bunt Live @FWD Nightclub 2024",
        description: "Shot and edited by Duddcash.",
        aspectRatio: "9/16",
      },
      {
        videoId: "98fb82d5-24f4-4d33-a2ed-c3950a347b62",
        title: "Loud Luxury Live @FWD Dayclub 2024",
        description: "Shot and edited by Duddcash.",
        aspectRatio: "9/16",
      },
      {
        videoId: "3f7cf58a-8126-4bcf-967a-1e093b5cbaad",
        title: "Good Night John Boy Chicago 2024",
        description: "Shot and edited by Duddcash.",
        aspectRatio: "16/9",
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
        videoId: "feb69c8e-1854-41ed-a3b4-071da21b503b",
        title: "TWO Friends Live @FWD Nightclub 2024",
        description: "Shot and edited by Duddcash.",
        aspectRatio: "9/16",
      },
    ],
  },
  {
    id: "thank-you-for-dancing",
    type: "project",
    title: "Thank You for Dancing",
    client: "2025-Present",
    description: "Our favorite recaps from an ongoing partnership.",
    role: "Shooters, Editors",
    categories: ["Nightlife"],
    featured: false,
    order: 1.2,
    customThumbnail: "/gallery/thumbnails/thank-you-for-dancing.jpg",
    thumbnailVideoId: "b26b54d0-1f87-4dfb-b374-c6c63d096b1f",
    videos: [
      {
        videoId: "4a218a27-2404-4139-ba96-eaee378af7ba",
        title: "Get Lucked — St. Patty's Day 2026",
        description: "Hype promo for Get Lucked St. Patty's Day 2026.",
        aspectRatio: "4/3",
      },
      {
        videoId: "dd29af91-22dd-4a91-9d69-1145e03c0c54",
        title: "Vice Yacht 2025",
        description: "Hype promo for Vice Yacht 2025",
        aspectRatio: "4/3",
      },
      {
        videoId: "b26b54d0-1f87-4dfb-b374-c6c63d096b1f",
        title: "Club Capri 2025",
        description: "Hype promo for the summer Club Capri series.",
        aspectRatio: "4/3",
      },
    ],
  },
  {
    id: "off-limits-festival",
    type: "project",
    title: "Off Limits Festival",
    client: "2025",
    description: "Our favorite social cuts from Off Limits 2025 in Abu Dhabi.",
    role: "Editors",
    categories: ["Nightlife"],
    featured: false,
    order: 1.3,
    customThumbnail: "/gallery/thumbnails/off-limits-festival.jpg",
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
    client: "2023",
    description: "Concert recap, 2023.",
    role: "Shoot/ Edit",
    categories: ["Nightlife"],
    featured: false,
    order: 1.4,
    customThumbnail: "/gallery/thumbnails/jacquees-hob-cleveland.jpg",
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
    client: "2026",
    description: "Après Ski Party, 2026.",
    categories: ["Nightlife"],
    featured: false,
    order: 1.5,
    customThumbnail: "/gallery/thumbnails/chc-apres-ski.jpg",
    video: {
      videoId: "16d8d1ab-dad1-4d8c-ba53-fddaa7bfdfa8",
      title: "Chicago Hotel Collection — Après Ski Party 2026",
      aspectRatio: "9/16",
    },
  },
  {
    id: "quincy-basketball",
    type: "single",
    title: "Quincy University Basketball - 2025",
    description: "Full game recap produced for Quincy University.",
    role: "Cam Op/ Editor",
    categories: ["Events"],
    featured: false,
    order: 11,
    customThumbnail: "/gallery/thumbnails/quincy-basketball.jpg",
    video: {
      videoId: "b3237e6e-8b3a-457c-8359-1d37a8ea0662",
      title: "Quincy",
      aspectRatio: "4/3",
    },
  },
  {
    id: "final-gain",
    type: "single",
    title: "Global AI Summit - 2024",
    description: "Directed a team of 7 shooters to capture tech-focused content featuring Western travelers at an AI-centered global summit showcasing technological advancements in Saudi Arabia.",
    role: "Director",
    credits: [
      { label: "Client", value: "Global AI Summit" },
      { label: "Producer", value: "@sabushaiqa" },
      { label: "Cam Op", value: "@badrayoub0 , @2mr.90 , @ifawaz8" },
      { label: "Drone", value: "@moe.fpv" },
      { label: "Director/ Editor", value: "Duddcash" },
    ],
    categories: ["Events"],
    featured: false,
    order: 12,
    customThumbnail: "/gallery/thumbnails/final-gain.jpg",
    video: {
      videoId: "762725e2-e1a5-44f4-b93c-94a3c12ee313",
      title: "Global AI Summit Promo Piece",
      aspectRatio: "4/5",
    },
  },
  {
    id: "rr-grammys",
    type: "single",
    title: "Republic Records Grammy Week",
    description: "2026",
    role: "Cam Op/ Editor",
    credits: [
      { label: "Production", value: "Yadayada Studio " },
    ],
    categories: ["Events"],
    featured: false,
    order: 13,
    customThumbnail: "/gallery/thumbnails/rr-grammys.jpg",
    video: {
      videoId: "48d993d5-b7b7-4faf-aaec-8eeee835225b",
      title: "RR Grammys Afterparty",
      aspectRatio: "9/16",
    },
  },
  {
    id: "reserve-cup-2025",
    type: "project",
    title: "Reserve Cup",
    client: "2025 ",
    description: "A collection of fast-turn edits created in collaboration with This Was Major",
    role: "Virtual Editors",
    credits: [
      { label: "Client", value: "Reserve Padel" },
      { label: "Production", value: "This Was Major" },
      { label: "Cam Op", value: "@olihackl, @tris416, @bryanemolina" },
      { label: "Drone", value: "@_deansadler" },
      { label: "Edit/VFX", value: "Duddcash" },
      { label: "DIT", value: "@bryanemolina" },
      { label: "PA", value: "@chrisb3ltran" },
    ],
    categories: ["Events"],
    featured: false,
    order: 14,
    customThumbnail: "/gallery/thumbnails/reserve-cup-2025.jpg",
    thumbnailVideoId: "2b348f0d-0bca-46ed-a518-a9706775e099",
    videos: [
      {
        videoId: "2b348f0d-0bca-46ed-a518-a9706775e099",
        title: "Reserve Cup Official Aftermovie",
        aspectRatio: "9/16",
      },
      {
        videoId: "dc4c3253-0030-40d5-ab56-9467dc268c62",
        title: "Day 1 Recap",
        aspectRatio: "4/5",
      },
      {
        videoId: "c3886483-70ac-4995-b22f-588762758c0c",
        title: "Day 2 Recap",
        aspectRatio: "4/5",
      },
      {
        videoId: "a5fee1c4-69a8-4801-b1c7-2a38acd73f92",
        title: "Day 3 Recap",
        aspectRatio: "4/5",
      },
    ],
  },
  {
    id: "wynn-f1-race-week",
    type: "project",
    title: "Ultimate Race Week at the Wynn",
    client: "2025",
    description: "4 daily recaps + aftermovie — shot, edited, and delivered by the end of the F1 Vegas weekend.",
    role: "Cam Op/ Editor",
    credits: [
      { label: "Client", value: "Wynn Las Vegas" },
      { label: "DIT", value: "@enriquemphoto" },
      { label: "Drone", value: "@jaybyrdfilms" },
      { label: "Cam Op", value: "Duddcash, @markdabu , @adamchapel_14" },
      { label: "Additional VFX", value: "Jayden Jones" },
    ],
    categories: ["Events"],
    featured: false,
    order: 15,
    customThumbnail: "/gallery/thumbnails/wynn-f1-race-week.jpg",
    thumbnailVideoId: "2ecb2e2c-0e4e-4d81-b6c8-4ba0e2f9e882",
    videos: [
      {
        videoId: "2ecb2e2c-0e4e-4d81-b6c8-4ba0e2f9e882",
        title: "Aftermovie - Directors Cut",
        aspectRatio: "9/16",
      },
      {
        videoId: "bafc174a-f89b-4e69-b9be-fa195c46bdd6",
        title: "Recap From Day 3",
        aspectRatio: "9/16",
      },
      {
        videoId: "5e7d3cf7-a169-4887-bdee-0d6b649bb59a",
        title: "Recap From Day 2",
        aspectRatio: "9/16",
      },
      {
        videoId: "5e425fcc-605b-40b4-9711-8b061ff8327d",
        title: "Recap From Day 1",
        aspectRatio: "9/16",
      },
      {
        videoId: "6d21b1c3-d809-433b-93d7-f4a524168e29",
        title: "Recap From Day 4",
        aspectRatio: "9/16",
      },
    ],
  },
  {
    id: "arnold-palmer-mastercard",
    type: "project",
    title: "Mastercard × Arnold Palmer Invitational",
    client: "2025",
    description: "Spent one week onsite capturing content for Mastercard.",
    role: "Director",
    credits: [
      { label: "Client", value: "Mastercard " },
      { label: "Production", value: "Yadayada Studio " },
    ],
    categories: ["Featured", "Events"],
    featured: true,
    order: 16,
    customThumbnail: "/gallery/thumbnails/arnold-palmer-mastercard.jpg",
    thumbnailVideoId: "6ca571d6-6c0b-4b33-9435-a59333041df8",
    videos: [
      {
        videoId: "6ca571d6-6c0b-4b33-9435-a59333041df8",
        title: "Arnold Palmer Invitational × Mastercard — Tournament Recap",
        aspectRatio: "4/5",
      },
      {
        videoId: "1bc5acea-1a93-4b74-8076-a64756e45a14",
        title: "A Jazzy Postcard Piece",
        aspectRatio: "4/5",
      },
      {
        videoId: "15cb801a-7003-45a8-b266-a309fec1880f",
        title: "A Cinematic Cut",
        aspectRatio: "9/16",
      },
      {
        videoId: "15281c60-5cfd-440d-8496-beec2f012940",
        title: "Welcome to API",
        aspectRatio: "9/16",
      },
      {
        videoId: "16cfb3b8-cfbb-420d-9f07-a5e89481adc7",
        title: "Priceless - Postcard",
        aspectRatio: "9/16",
      },
      {
        videoId: "7471c896-ccf7-4b38-92b5-0dd55d1fc019",
        title: "Gearing up - Postcard",
        aspectRatio: "9/16",
      },
    ],
  },
  {
    id: "modball",
    type: "project",
    title: "Modball - Car Rally",
    client: "2025",
    description: "7 cities, 7 days across Europe.",
    role: "Cam Op, Editor, VFX",
    categories: ["Events"],
    featured: false,
    order: 17,
    customThumbnail: "/gallery/thumbnails/modball.jpg",
    thumbnailVideoId: "9321db06-a3cb-4bec-aee7-2dc33bd00e1a",
    videos: [],
    sections: [
      {
        title: "Event",
        description: "A collection of the best moments from the rally.",
        videos: [
          {
            videoId: "9321db06-a3cb-4bec-aee7-2dc33bd00e1a",
            title: "Ibiza - The Finish Line",
            aspectRatio: "4/3",
          },
          {
            videoId: "5e15d127-2b93-45d8-8762-da75ff754ad1",
            title: "Sunset Vibes in Barcelona",
            aspectRatio: "4/5",
          },
          {
            videoId: "166bf9c4-637e-4356-a386-3fbd5ab89be9",
            title: "Vibes from Venice - 1",
            aspectRatio: "4/3",
          },
          {
            videoId: "61630c88-24db-458c-9f48-445308823116",
            title: "Vibes from Venice - 2",
            aspectRatio: "4/3",
          },
          {
            videoId: "9eec7900-02ed-4487-9187-b10bdfac30b5",
            title: "Rome — Almost Race Time.",
            aspectRatio: "4/3",
          },
          {
            videoId: "c946cc77-3ee5-438d-aa2f-0625905de27b",
            title: "A multi-city recap",
            aspectRatio: "16/9",
          },
        ],
      },
      {
        title: "Post Cards",
        description: "These were too good not to include.",
        videos: [
          {
            videoId: "c60b40c3-9abc-48eb-8858-cb639b6c9248",
            title: "St Tropez 1",
            aspectRatio: "4/3",
          },
          {
            videoId: "da08655d-147f-4444-b336-0c3edf8a05db",
            title: "St Tropez 2",
            aspectRatio: "4/3",
          },
          {
            videoId: "ece25347-ee29-4a3a-9a31-6ef2000ceabc",
            title: "St Tropez 3",
            aspectRatio: "4/3",
          },
          {
            videoId: "b029fc00-d940-47fd-910c-f10e5c2d05ec",
            title: "St Tropez 4",
            aspectRatio: "4/3",
          },
          {
            videoId: "cc1befe1-feb2-436f-b3d5-b301b73e830a",
            title: "St Tropez 5",
            aspectRatio: "4/3",
          },
          {
            videoId: "c2cc6852-a7bf-4f05-9525-8d1479e33bbc",
            title: "St Tropez 6",
            aspectRatio: "4/3",
          },
          {
            videoId: "64d93c7e-fd21-4b61-827e-3451bbc947d5",
            title: "St Tropez 7",
            aspectRatio: "4/3",
          },
        ],
      },
      {
        title: "Pre Event",
        description: "Work leading up to the big day.",
        role: "Virtual Editors",
        videos: [
          {
            videoId: "dd634711-8e7e-45c9-ba07-9b15f92a1062",
            title: "Out in the Desert",
            description: "Edited using footage shot by Benjamin Gugick",
            aspectRatio: "4/5",
          },
          {
            videoId: "ab725a2c-1761-4028-811d-6a6297e0e371",
            title: "Getting Started",
            aspectRatio: "9/16",
          },
          {
            videoId: "ff1b3eaf-720c-48b5-924a-375888e85c9a",
            title: "Promo Edit",
            aspectRatio: "9/16",
          },
          {
            videoId: "d2446fc9-76ef-498d-939d-8766887d863a",
            title: "Promo Edit - 2",
            aspectRatio: "9/16",
          },
          {
            videoId: "d5023e53-8382-4781-8d8e-34f57fe7b5f3",
            title: "Promo Edit - 3",
            aspectRatio: "9/16",
          },
          {
            videoId: "f38de959-4b03-40a5-891d-ef5a57ae9c14",
            title: "Promo Edit -4",
            aspectRatio: "4/5",
          },
        ],
      },
    ],
  },
  {
    id: "tw-announcement",
    type: "single",
    title: "Trevor Wallace",
    description: "Promotional piece for Trevor’s first special.",
    role: "Virtual Editor",
    credits: [
      { label: "Cam Op", value: "Benjamin Gugick" },
    ],
    categories: ["Entertainment"],
    featured: false,
    order: 18,
    customThumbnail: "/gallery/thumbnails/tw-announcement.jpg",
    video: {
      videoId: "d6fec50c-f910-4cb4-a9e8-d5fa4d40048d",
      title: "",
      aspectRatio: "9/16",
    },
  },
  {
    id: "sound-design-v2",
    type: "single",
    title: "Stanley Cup — Game Promo",
    description: "A sound design–driven piece recapping the game",
    role: "Virtual Editor",
    credits: [
      { label: "Cam Op", value: "Benjamin Gugick" },
    ],
    categories: ["Entertainment"],
    featured: false,
    order: 19,
    customThumbnail: "/gallery/thumbnails/sound-design-v2.jpg",
    video: {
      videoId: "056b8204-8a8c-4b80-9abd-0cfc7d440afe",
      title: "Sound Design V2",
      aspectRatio: "9/16",
    },
  },
  {
    id: "rose-bts",
    type: "single",
    title: "Rosé",
    description: "BTS cut for ROSÉ music video shoot for the F1 soundtrack.",
    role: "Virtual Editor",
    credits: [
      { label: "Cam Op", value: "@evanhammerman" },
    ],
    categories: ["Entertainment"],
    featured: false,
    order: 20,
    customThumbnail: "/gallery/thumbnails/rose-bts.jpg",
    video: {
      videoId: "7dc2d9a6-1dc3-417e-9c54-9fa48bfcb703",
      title: "",
      aspectRatio: "16/9",
    },
  },
  {
    id: "denzel-promo",
    type: "single",
    title: "Denzel Ward",
    description: "Promotional piece with Denzel Ward for an upcoming podcast with Sumedh Basani.",
    role: "Cam Op/ Editor",
    categories: ["Entertainment"],
    featured: false,
    order: 21,
    customThumbnail: "/gallery/thumbnails/denzel-promo.jpg",
    video: {
      videoId: "3388ab25-a291-4c07-9ebe-3828622edd11",
      title: "",
      aspectRatio: "9/16",
    },
  },
  {
    id: "andor-disney-fyc",
    type: "single",
    title: "Andor x Disney FYC Fest",
    description: "Quick turn piece for FYC Fest",
    role: "Virtual Editors",
    credits: [
      { label: "Production", value: "Armada Projects " },
      { label: "VFX", value: "Jayden Jones" },
    ],
    categories: ["Entertainment"],
    featured: false,
    order: 22,
    customThumbnail: "/gallery/thumbnails/andor-disney-fyc.jpg",
    video: {
      videoId: "e5310b69-ec28-48c9-a216-44bd0ba77805",
      title: "",
      aspectRatio: "16/9",
    },
  },
  {
    id: "dwayne-johnson",
    type: "project",
    title: "Dwayne Johnson",
    client: "2024",
    description: "Selected Cuts",
    role: "Virtual Editor",
    credits: [
      { label: "Production", value: "Armada Projects " },
    ],
    categories: ["Entertainment"],
    featured: false,
    order: 23,
    customThumbnail: "/gallery/thumbnails/dwayne-johnson.jpg",
    thumbnailVideoId: "7a4e6ecd-5d57-4e82-9fa9-4c5395fffeb2",
    videos: [
      {
        videoId: "7a4e6ecd-5d57-4e82-9fa9-4c5395fffeb2",
        title: "Red One Press Tour - London",
        aspectRatio: "9/16",
      },
      {
        videoId: "ec35bd8c-c484-42b1-918b-efbce6234b74",
        title: "Red One Press Tour - London",
        description: "Graham Norton Sofa Bumper Reel",
        aspectRatio: "9/16",
      },
      {
        videoId: "0a69ebca-da5a-4ebd-b9f9-5f9a94cb3cb4",
        title: "Social BTS Cut",
        aspectRatio: "9/16",
      },
    ],
  },
  {
    id: "movie-premier-work",
    type: "project",
    title: "Premieres",
    client: "",
    description: "A collection of rapid-turn overnight edits.",
    role: "Virtual Editor",
    credits: [
      { label: "Production ", value: "Armada Projects " },
      { label: "EP", value: "@jonbrandoncruz, @andrew_sandler" },
      { label: "Cam Ops", value: "@evanhammerman, @davemalave " },
    ],
    categories: ["Entertainment"],
    featured: false,
    order: 24,
    customThumbnail: "/gallery/thumbnails/movie-premier-work.jpg",
    thumbnailVideoId: "494299f2-ffbc-4afe-8e82-3eeab8cfc8e8",
    videos: [
      {
        videoId: "494299f2-ffbc-4afe-8e82-3eeab8cfc8e8",
        title: "Fly Me to the Moon — Berlin",
        description: "Scarlett Johansson × Channing Tatum",
        aspectRatio: "9/16",
      },
      {
        videoId: "df7910d8-8bd3-4be9-ba08-3fcf80b26e76",
        title: "The Fall Guy",
        description: "Ryan Gosling",
        aspectRatio: "9/16",
      },
      {
        videoId: "87b7783d-fa30-4ae8-9b5d-9048fa1ea2c8",
        title: "Furiosa: A Mad Max Saga",
        description: "Chris Hemsworth × Anya Taylor-Joy",
        aspectRatio: "16/9",
      },
    ],
  },
  {
    id: "sebestian",
    type: "project",
    title: "It Ain’t Right Tour — Sebastian Maniscalco",
    client: "2024",
    description: "Traveled with Sebastian and the team on the Ain’t Right Tour, creating overnight recaps of select shows.",
    role: "Director",
    categories: ["Entertainment"],
    featured: false,
    order: 25,
    customThumbnail: "/gallery/thumbnails/sebestian.jpg",
    thumbnailVideoId: "25b0a96a-abb3-4dfa-8972-83d4ed91b030",
    videos: [
      {
        videoId: "25b0a96a-abb3-4dfa-8972-83d4ed91b030",
        title: "Nashville - Show Recap",
        aspectRatio: "9/16",
      },
      {
        videoId: "de21ebc1-fd8b-4b8e-a493-3e27bb0658df",
        title: "LA - Show Recap",
        aspectRatio: "9/16",
      },
      {
        videoId: "5bd30131-2c18-4867-af27-89420de907fa",
        title: "Orlando - Show Recap",
        aspectRatio: "9/16",
      },
      {
        videoId: "4a88cc0c-c324-40cd-b7d9-523aa5ad9084",
        title: "Atlanta - Show Recap",
        aspectRatio: "9/16",
      },
      {
        videoId: "05a9df39-0252-41b0-96dd-a49fb8f3f335",
        title: "SF - Show Recap",
        aspectRatio: "9/16",
      },
    ],
  },
  {
    id: "hyper-montage-rome",
    type: "single",
    title: "Rome — Hyper Montage",
    description: "A cut made from leftover footage from our time on the Modball Rally.",
    categories: ["Travel"],
    featured: false,
    order: 26,
    customThumbnail: "/gallery/thumbnails/hyper-montage-rome.jpg",
    video: {
      videoId: "17adbeaf-d9ff-4797-8034-9f978edf16be",
      title: "as",
      aspectRatio: "4/3",
    },
  },
  {
    id: "nyc-edit",
    type: "single",
    title: "5 Days in Manhattan",
    description: "Five days in Manhattan on the Ain’t Right Tour, documenting the city between shows.",
    categories: ["Travel"],
    featured: false,
    order: 27,
    customThumbnail: "/gallery/thumbnails/nyc-edit.jpg",
    video: {
      videoId: "5090168a-7ac0-4bfe-8e07-0e3239f5239c",
      title: "",
      aspectRatio: "4/5",
    },
  },
  {
    id: "santino-car",
    type: "single",
    title: "Tesla Edit",
    description: "2024",
    categories: [],
    featured: false,
    order: 28,
    customThumbnail: "/gallery/thumbnails/santino-car.jpg",
    video: {
      videoId: "d89c62f1-a102-4de1-b8c1-67e8ac77be7c",
      title: "",
      aspectRatio: "9/16",
    },
  },
  {
    id: "costa-rica",
    type: "project",
    title: "Naia Villas",
    client: "2025",
    description: "One week in Costa Rica, capturing content for Naia Villas.",
    role: "Director",
    categories: ["Travel"],
    featured: false,
    order: 29,
    customThumbnail: "/gallery/thumbnails/costa-rica.jpg",
    thumbnailVideoId: "a21e6c86-c6c9-4eeb-bb9e-da895535cba8",
    videos: [
      {
        videoId: "336f2236-f800-41df-8739-020e9e1cdf5d",
        title: "Volume Up!",
        aspectRatio: "16/9",
      },
      {
        videoId: "a21e6c86-c6c9-4eeb-bb9e-da895535cba8",
        title: "Experimental — Documentary Style",
        aspectRatio: "4/5",
      },
      {
        videoId: "9c4f05a1-23be-49ff-adc9-d2e3af93a038",
        title: "Visual Effects–Driven Property Showcase",
        aspectRatio: "16/9",
      },
    ],
  },
  {
    id: "video-2-tv-ad",
    type: "single",
    title: "Candy Cloud",
    description: "3D Piece for Candy Cloud",
    categories: ["Culinary"],
    featured: false,
    order: 30,
    video: {
      videoId: "e5a26794-5a40-4b83-8862-164e8185602a",
      title: "",
      aspectRatio: "9/16",
    },
  },
  {
    id: "magazine",
    type: "single",
    title: "Menu Flip",
    description: "",
    categories: ["Culinary"],
    featured: false,
    order: 31,
    video: {
      videoId: "7ef5bc9d-d68c-4a73-b527-8da898c23b14",
      title: "",
      aspectRatio: "9/16",
    },
  },
  {
    id: "cinematic-collage",
    type: "single",
    title: "Porta Rossa",
    description: "Cinematic montage",
    categories: ["Culinary"],
    featured: false,
    order: 32,
    customThumbnail: "/gallery/thumbnails/cinematic-collage.jpg",
    video: {
      videoId: "05590db5-d109-46ee-88f9-84ae16a7945e",
      title: "",
      aspectRatio: "9/16",
    },
  },
  {
    id: "tao",
    type: "project",
    title: "TAO Chicago",
    client: "2025",
    description: "Created two pieces highlighting TAO’s new exclusive menu.",
    role: "Director",
    credits: [
      { label: "Client", value: "Tao Chicago " },
    ],
    categories: ["Featured", "Culinary"],
    featured: true,
    order: 33,
    customThumbnail: "/gallery/thumbnails/tao.jpg",
    thumbnailVideoId: "d427c6ba-48f8-430d-8905-52b89d38bf4e",
    videos: [
      {
        videoId: "e0ba1b22-c35c-4de3-9451-556e041ed7aa",
        title: "Couple Date Night \"Which One\"",
        aspectRatio: "4/3",
      },
      {
        videoId: "d427c6ba-48f8-430d-8905-52b89d38bf4e",
        title: "Anticipation...",
        aspectRatio: "4/3",
      },
    ],
  },
  {
    id: "new-single-1775791543025",
    type: "single",
    title: "Inspired by Ye",
    description: "2024",
    role: "Director",
    categories: ["Spec Creative"],
    featured: false,
    order: 9999,
    customThumbnail: "/gallery/thumbnails/new-single-1775791543025.jpg",
    video: {
      videoId: "8f5f96ee-a9d4-4209-9c5d-47c70d34e5f2",
      title: "",
      aspectRatio: "16/9",
    },
  },
  {
    id: "new-single-1775797777079",
    type: "single",
    title: "Complicated",
    description: "2025",
    role: "Director",
    categories: ["Spec Creative"],
    featured: false,
    order: 9999,
    customThumbnail: "/gallery/thumbnails/new-single-1775797777079.jpg",
    video: {
      videoId: "e6b1aafa-b9d7-4fd3-8e87-4537d7d282bf",
      title: "Complicated",
      aspectRatio: "9/16",
    },
  },
]
