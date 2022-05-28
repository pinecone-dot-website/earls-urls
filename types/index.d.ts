export {};

declare global {
  namespace Express {
    interface Request {
      flash?: Function;
    }

    interface User {
      id: number;
      username: string;
    }
  }
}
