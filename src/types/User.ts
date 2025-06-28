import Permission from "./Permission";
import Role from "./Role";

interface User{
  id: number,
  name: string,
  email: string,
  password?: string,
  avatar: string | null,
  telephone?: string | null,
  cin?: string | null,
  taille?: number | null,
  poids?: Array<{date: string, valeur: number}> | null,
  objectif?: 'prise de masse' | 'perte de poids' | 'maintien' | 'prise de force' | 'endurance' | 'remise en forme' | 'sèche' | 'souplesse' | 'rééducation' | 'tonification' | 'préparation physique' | 'performance' | null,
  sexe?: 'homme' | 'femme' | null,
  date_naissance?: string | null,
  email_verified_at?: string | null,
  created_at: string,
  updated_at: string,
  roles?: Role[],
  permissions?: Permission[],
  challengers?: User[],
  coachs?: User[]
}

export default User;
