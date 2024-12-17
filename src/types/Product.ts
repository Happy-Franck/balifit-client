interface Product{
  id: number,
  name: string,
  description: string,
  image: string,
  poid: number,
  price: number,
  rating?: number,
  user_id: number | null,
  created_at: string,
  updated_at: string
}
export default Product;
