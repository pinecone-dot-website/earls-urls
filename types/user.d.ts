interface UserRow {
  id: number;
  username: string;
  password: string;
  
  toJSON: Function;
}

interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
}