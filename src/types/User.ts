import Permission from "./Permission";
import Role from "./Role";

interface User{
  id: number,
  name: string,
  email: string,
  password: string,
  avatar: string | null,
  created_at: string,
  updated_at: string,
  roles?: Role[],
  permissions?: Permission[],
  challengers?: User[],
  coachs?: User[]
}
export default User;
