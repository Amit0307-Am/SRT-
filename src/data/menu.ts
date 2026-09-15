export type MenuItem = {
  id: string
  name: string
  category: string
  image?: string
  description?: string
  price?: number
  sizes?: {
    small?: number
    medium?: number
    large?: number
  }
  addOns?: {
    name: string
    prices?: {
      small?: number
      medium?: number
      large?: number
    }
  }[]
  popular?: boolean
  special?: boolean
}

export const menuItems: MenuItem[] = [
  {
    id: 'paneer-tikka-pizza',
    name: 'Paneer Tikka Pizza',
    category: 'Pizza',
    sizes: { small: 160, medium: 210, large: 260 },
    popular: true,
    addOns: [
      { name: 'Extra Cheese', prices: { small: 20, medium: 40, large: 60 } },
      { name: 'Cheese Burst', prices: { small: 50, medium: 70, large: 100 } },
    ],
  },
  {
    id: 'srt-special-pizza',
    name: 'SRT Special Pizza',
    category: 'Pizza',
    sizes: { small: 300, medium: 400, large: 500 },
    special: true,
    addOns: [
      { name: 'Extra Cheese', prices: { small: 20, medium: 40, large: 60 } },
      { name: 'Cheese Burst', prices: { small: 50, medium: 70, large: 100 } },
    ],
  },
  {
    id: 'onion-pizza',
    name: 'Onion Pizza',
    category: 'Pizza',
    sizes: { small: 99, medium: 149, large: 199 },
    addOns: [
      { name: 'Extra Cheese', prices: { small: 20, medium: 40, large: 60 } },
      { name: 'Cheese Burst', prices: { small: 50, medium: 70, large: 100 } },
    ],
  },
  {
    id: 'cheese-burger',
    name: 'Cheese Burger',
    category: 'Burger',
    description: 'Ask on WhatsApp',
    popular: true,
  },
  {
    id: 'srt-sandwich',
    name: 'SRT Sandwich',
    category: 'Sandwich',
    description: 'Ask on WhatsApp',
    special: true,
  },
  {
    id: 'cold-coffee',
    name: 'Cold Coffee',
    category: 'Cold Coffee',
    description: 'Ask on WhatsApp',
  },
  {
    id: 'mocktail',
    name: 'Mocktail',
    category: 'Mocktails',
    description: 'Ask on WhatsApp',
  },
  {
    id: 'tea',
    name: 'Tea',
    category: 'Tea',
    description: 'Ask on WhatsApp',
  },
  {
    id: 'bhel',
    name: 'Bhel',
    category: 'Bhel',
    description: 'Ask on WhatsApp',
  },
  {
    id: 'momos',
    name: 'Momos',
    category: 'Momos',
    description: 'Ask on WhatsApp',
  },
]

export const categories = [
  'All',
  'Pizza',
  'Burger',
  'Sandwich',
  'Rolls',
  'Fries',
  'Drinks',
  'Other',
] as const

export const featuredItems = ['srt-special-pizza', 'paneer-tikka-pizza', 'onion-pizza', 'cheese-burger', 'srt-sandwich']
