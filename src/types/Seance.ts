interface Seance{
  id: number,
  admin_id: number | null,
  coach_id: number | null,
  challenger_id: number,
  validated: boolean | null,
  img_debut: string | null,
  img_fin: string | null,
  created_at: string,
  updated_at: string,
}
export default Seance;
