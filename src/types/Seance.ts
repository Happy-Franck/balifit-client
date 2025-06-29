import User from './User'
import Training from './Training'

interface Seance {
  id: number,
  admin_id: number | null,
  coach_id: number | null,
  challenger_id: number,
  validated: boolean | null,
  img_debut: string | null,
  img_fin: string | null,
  created_at: string,
  updated_at: string,
  // Relations
  admin?: User | null,
  coach?: User | null,
  challenger?: User,
  trainings?: Training[],
  // Counts
  trainings_count?: number,
}
export default Seance;
