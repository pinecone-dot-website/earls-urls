export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

export default class HTTP_Error extends Error {
  status: HttpStatusCode;

  constructor(message: string, status: HttpStatusCode) {
    super(message);

    this.status = status;
  }
}