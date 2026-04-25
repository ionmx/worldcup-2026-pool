export interface UserData {
  email: string;
  displayName: string;
  photoURL: string;
  score: number;
  admin: boolean;
}

export interface UserWithId extends UserData {
  id: string;
}
