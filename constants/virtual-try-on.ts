export interface ClothingItem {
  id: string;
  name: string;
  image: string;
  category: "all" | "traditional" | "western" | "saree" | "fusion" | "men";
}

export const VIRTUAL_TRY_ON_ITEMS: ClothingItem[] = [
  // Women's Collection
  {
    id: "elegant-red-anarkali",
    name: "Elegant Red Anarkali",
    image: "/virtual-try-on/women/elegant-red-anarkali.png",
    category: "traditional",
  },
  {
    id: "elegant-yellow-salwar",
    name: "Yellow Salwar Suit",
    image: "/virtual-try-on/women/elegant-yellow-salwar.png",
    category: "traditional",
  },
  {
    id: "indo-western",
    name: "Indo-Western Fusion",
    image: "/virtual-try-on/women/indo-western.png",
    category: "fusion",
  },
  {
    id: "pink-saree",
    name: "Royal Pink Saree",
    image: "/virtual-try-on/women/pink-saree.png",
    category: "saree",
  },
  {
    id: "teal-saree",
    name: "Teal Silk Saree",
    image: "/virtual-try-on/women/teal-saree.png",
    category: "saree",
  },
  {
    id: "traditional-kurta",
    name: "Traditional Maroon Kurta",
    image: "/virtual-try-on/women/traditional-kurta.png",
    category: "traditional",
  },
  
  // Men's Collection
  {
    id: "all-black",
    name: "All Black Ensemble",
    image: "/virtual-try-on/men/all-black.png",
    category: "men",
  },
  {
    id: "black-leather",
    name: "Black Leather Jacket",
    image: "/virtual-try-on/men/black-leather.png",
    category: "men",
  },
  {
    id: "casual-denim",
    name: "Casual Denim Look",
    image: "/virtual-try-on/men/casual-denim.png",
    category: "men",
  },
  {
    id: "denim-chic",
    name: "Denim Chic Layering",
    image: "/virtual-try-on/men/denim-chic.png",
    category: "men",
  },
  {
    id: "formal",
    name: "Sharp Formal Suit",
    image: "/virtual-try-on/men/formal.png",
    category: "men",
  },
  {
    id: "modern",
    name: "Modern Urban Wear",
    image: "/virtual-try-on/men/modern.png",
    category: "men",
  },
  {
    id: "streetware",
    name: "Streetwear Vibes",
    image: "/virtual-try-on/men/streetware.png",
    category: "men",
  },
  {
    id: "stylish",
    name: "Stylish Smart Casual",
    image: "/virtual-try-on/men/stylish.png",
    category: "men",
  },
];
