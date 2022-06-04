interface ExternalURLData {
  error?: Error;
  meta?: ExternalURLMeta;
  request: {
    redirects: Array<ExternalURLRequest>;
  }
}

interface ExternalURLMeta {
  title: string;
  description?: string;
  img?: string;
}

interface ExternalURLHtml {
  body: string;
  origin: URL['origin'];
}

interface ExternalURLRequest {
  status: number;
  url: string;
}

interface ExternalURLReject {
  (reason?: any): void
}

interface ExternalURLResolve { 
  (value: unknown): void; 
  (origin: URL['origin']): ExternalURLHtml; 
}