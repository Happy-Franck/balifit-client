interface Equipment {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  user_id: number | null;
  created_at?: string;
  updated_at?: string;
  pivot?: any;
}

export default Equipment; 