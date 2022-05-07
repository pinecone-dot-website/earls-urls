declare namespace Express {
  export interface Request {
    flash?: Function;
  }

  export interface User {
    id: number;
    username: string;
  }
}
