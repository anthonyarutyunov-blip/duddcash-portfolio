import { FileTree, type FileNode } from "./file-tree"

export const navData: FileNode[] = [
  {
    name: "DUDDCASH",
    type: "folder",
    children: [
      {
        name: "work",
        type: "folder",
        href: "/#portfolio",
        children: [
          { name: "featured.tsx", type: "file", extension: "tsx", href: "/?filter=Featured#portfolio" },
          { name: "events.tsx", type: "file", extension: "tsx", href: "/?filter=Events#portfolio" },
          { name: "nightlife.tsx", type: "file", extension: "tsx", href: "/?filter=Nightlife#portfolio" },
          { name: "entertainment.tsx", type: "file", extension: "tsx", href: "/?filter=Entertainment#portfolio" },
          { name: "branded-&-social.tsx", type: "file", extension: "tsx", href: "/?filter=Branded+%26+Social#portfolio" },
          { name: "spec-creative.tsx", type: "file", extension: "tsx", href: "/?filter=Spec+Creative#portfolio" },
          { name: "travel.tsx", type: "file", extension: "tsx", href: "/?filter=Travel#portfolio" },
        ],
      },
      {
        name: "photo",
        type: "folder",
        children: [
          { name: "fujix100f", type: "folder" },
        ],
      },
      { name: "about.md", type: "file", extension: "md", href: "/about" },
      { name: "contact.json", type: "file", extension: "json", href: "/contact" },
    ],
  },
]

export default function FileTreeNav() {
  return <FileTree data={navData} className="w-full" />
}
