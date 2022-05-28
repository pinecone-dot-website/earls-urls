export {};
declare global {
  namespace Express {
    interface Request {
      flash?: Function;
    }
  }
}
