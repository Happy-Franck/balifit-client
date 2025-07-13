import Product from './Product';
import ProductAttribute from './ProductAttribute';

interface ProductType {
  id: number,
  name: string,
  slug: string,
  description?: string,
  image?: string,
  is_active: boolean,
  created_at: string,
  updated_at: string,
  produits?: Product[],
  active_produits?: Product[],
  attributes?: ProductAttribute[]
}

export default ProductType; 