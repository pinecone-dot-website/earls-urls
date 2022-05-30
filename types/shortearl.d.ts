interface EarlRow {
  id: number;
  createdAt: string;
  userId: number;
  url: string;

  get: Function;
  toJSON: Function;
}

interface ShortEarl {
  earl: string;
  short_url: string;
}
