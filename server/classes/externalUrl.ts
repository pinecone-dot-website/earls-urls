import http from 'http';
import https from 'https';
import { parse } from 'node-html-parser';

class ExternalURL {
  url: string;
 
  redirects: Array<ExternalURLRequest> = [];

  html: string = '';

  /**
   * 
   * @param url 
   */
  constructor(url:string) {
    this.url = url;
  }

  /**
   * 
   * @returns 
   */
  getSiteData(): Promise<ExternalURLData> {
    const data = new Promise((resolve: ExternalURLResolve, reject: ExternalURLReject) => {
      // console.log('getSiteData');

      return this.getHTML(this.url, resolve, reject);
    }).then((origin) => {
      return this.parseHTML(origin);
    }).then((meta)=>{
      return {
        meta,
        request:{
          redirects: this.redirects,
        },
      };
    }).catch((err)=>{
      return {
        error: err,
        request:{
          redirects: this.redirects,
        },
      };
    });

    return data;
  }

  /**
   * 
   * @param externalUrl 
   * @returns 
   */
  getHTML(externalUrl: string, resolve: ExternalURLResolve, reject: ExternalURLReject) {
    const adapter = ExternalURL.getAdapter(externalUrl);
    
    adapter.get(externalUrl, (res) => {
      // console.log('get');
      
      this.redirects.push({
        status: res.statusCode,
        url: externalUrl,
      });
    
      const redirectTo = res.headers.location;
      // console.log('res.statusCode, redirect ', res.statusCode, this.redirects.length);

      if (redirectTo) {
        return this.redirects.length < 5 ? 
          this.getHTML(redirectTo, resolve, reject) : 
          reject(new Error('too many redirects'));
      }

      return new Promise(() => {
        res.on('data', (chunk: string) => {
          this.html += chunk;
        });
        
        res.on('end', () => {
          const origin = new URL(externalUrl).origin;
          
          resolve(origin);
        });

        res.on('error', (e)=>{
          reject(e);
        });
      });
    }).on('error', (e) => {
      reject(e);
    });
  }

  /**
   * 
   * @param externalUrl 
   */
  static getAdapter(externalUrl: string):(typeof http | typeof https) {
    const adapters = {
      'http:': http, 
      'https:': https,
    };
    const protocol = new URL(externalUrl).protocol;
    
    if (protocol in adapters) {
      return adapters[protocol];
    }

    throw new Error('protocol not supported: ' + protocol);
  }

  /**
   * @param url
   */
  parseHTML(url: URL['origin']): ExternalURLMeta {
    const doc = parse(this.html);
    const metas = doc.querySelectorAll('meta');
    // const links = doc.querySelectorAll('link');
    const title = doc.querySelector('title');

    // console.log('links', links);
    
    const response: ExternalURLMeta = {
      title: title?.textContent,
    };

    metas.map((tag)=>{
      // console.log(
      //   'tag', 
      //   tag.getAttribute('property') || tag.getAttribute('name') || tag.getAttribute('itemprop'),
      // );
        
      switch (tag.getAttribute('property') || tag.getAttribute('name') || tag.getAttribute('itemprop') ) {
        case 'description':
        case 'og:description':
          response.description = tag.getAttribute('content');
          break;

        case 'image':
        case 'og:image':
        case 'msapplication-TileImage':
          response.img = new URL(tag.getAttribute('content'), url).href;
          console.log('response.img', response.img);
          break; 
      }
    }); 

    return response;
  }
}

export default ExternalURL;