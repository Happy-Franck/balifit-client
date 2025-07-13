interface Product{
  id: number,
  name: string,
  description: string,
  image: string,
  poid: number,
  price: number,
  rating?: number,
  user_id: number | null,
  product_type_id?: number | null,
  product_type?: {
    id: number,
    name: string,
    slug: string,
    description?: string,
    image?: string,
    is_active: boolean
  },
  stock_quantity: number,
  is_active: boolean,
  created_at: string,
  updated_at: string,
  
  // Nouvelles propriétés pour les variantes
  has_variants?: boolean,
  variants_count?: number,
  active_variants_count?: number,
  available_variants_count?: number,
  total_stock?: number,
  price_range?: {
    min: number,
    max: number
  },
  
  // Relations
  user?: {
    id: number,
    name: string,
    email?: string,
    avatar?: string
  },
  
  // Note moyenne
  note?: number,
  
  // Avis clients
  avis?: Array<{
    id: number,
    comment: string,
    note: number,
    created_at: string,
    user: {
      id: number,
      name: string,
      avatar?: string
    }
  }>,
  
  // Variantes
  variants?: Array<{
    id: number,
    sku: string,
    name?: string,
    full_name?: string,
    price: number,
    formatted_price?: string,
    compare_price?: number,
    stock_quantity: number,
    weight?: number,
    image?: string,
    is_active: boolean,
    attributes?: Array<{
      value_id: number,
      attribute_id: number,
      attribute_name: string,
      attribute_type: string,
      label: string,
      value: string,
      color_code?: string,
      price_modifier?: number
    }>
  }>,
  
  // Attributs disponibles
  available_attributes?: Array<{
    id: number,
    name: string,
    slug: string,
    type: string,
    description?: string,
    is_required: boolean,
    is_active: boolean,
    values?: Array<{
      id: number,
      value: string,
      label: string,
      color_code?: string,
      price_modifier?: number,
      sort_order?: number,
      is_active: boolean
    }>
  }>
}

export default Product;
