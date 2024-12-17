import Category from "./Category";
interface Training{
  id: number,
  name: string,
  description: string,
  image: string | null,
  video: string | null,
  user_id: number | null,
  categories: Category[] | null
  pivot?: any
}
export default Training;
