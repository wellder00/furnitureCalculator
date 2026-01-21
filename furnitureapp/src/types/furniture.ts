export interface FurnitureItem {
  name: string
  unit: string
  price: number
}

export interface FurnitureData {
  [category: string]: FurnitureItem[]
}

export interface OrderItem extends FurnitureItem {
  category: string
  quantity: number
  total: number
  includePrice: boolean
}

export interface Project {
  id: string
  name: string
  orders: OrderItem[]
  createdAt: string
  updatedAt: string
}
