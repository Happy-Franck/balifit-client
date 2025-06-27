import Category from "./Category";
import Equipment from "./Equipment";

interface Training{
  id: number,
  name: string,
  description: string,
  image: string | null,
  video: string | null,
  user_id: number | null,
  categories: Category[] | null,
  equipments: Equipment[] | null,
  pivot?: any
}
export default Training;
