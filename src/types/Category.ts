interface Category{
  id: number,
  name: string,
  image: string | null,
  user_id: number | null,
  created_at: string,
  updated_at: string,
  trainings?: Training[],
}

interface Training {
  id: number,
  name: string,
  description: string,
  image?: string,
  video?: string,
  categories?: Category[],
}

export default Category;
