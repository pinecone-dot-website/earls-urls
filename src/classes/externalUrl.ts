import http from 'http';
import https from 'https';
import { parse } from 'node-html-parser';

class ExternalURL {
  /**
   * 
   * @param externalUrl 
   * @returns 
   */
  static getSiteTags(externalUrl: string) {
    const data = new Promise((resolve, reject) => ExternalURL.getHTML(externalUrl, resolve, reject))
      .then(({ body, origin }) => {
        console.log('then', origin);
        return ExternalURL.parseHTML(body, origin);
      });

    return data;
  }

  /**
   * 
   * @param externalUrl 
   * @returns 
   */
  static getHTML(externalUrl: string, resolve, reject) {
    const adapter = ExternalURL.getAdapter(externalUrl);
    console.log('getHTML', externalUrl);
    
    adapter.get(externalUrl, (res) => {
      console.log('res.statusCode', res.statusCode, res.headers.location);
      if (res.headers.location) {
        return ExternalURL.getHTML(res.headers.location, resolve, reject);
      }

      let body = '';

      return new Promise(() => {
        res.on('data', chunk => {
        //   console.log('getExternalURL data', chunk);
          body += chunk;
        });
        
        res.on('end', ()=>{
          const origin = new URL(externalUrl).origin;
          console.log('getExternalURL end', origin);
          resolve({ body, origin });
        });
      });
      
    });
  }

  /**
   * 
   * @param externalUrl 
   */
  static getAdapter(externalUrl: string) {
    const adapters = {
      'http:': http, 
      'https:': https,
    };
    const protocol = new URL(externalUrl).protocol;
    
    if (protocol in adapters) {
      // console.log('type', typeof adapters[protocol]);
      return adapters[protocol];
    }

    return false;
  }

  /**
   * 
   * @param html 
   */
  static parseHTML(html: string, url: string): ExternalURLData {
    // console.log('parseHTML', html);

    const doc = parse(html);
    const meta = doc.querySelectorAll('meta');
    const response: ExternalURLData = {
      title: doc.querySelector('title').textContent,
    };

    meta.map((tag)=>{
      console.log(
        'tag', 
        tag.getAttribute('property') || tag.getAttribute('name') || tag.getAttribute('itemprop'),
      );
        
      switch (tag.getAttribute('property') || tag.getAttribute('name') || tag.getAttribute('itemprop') ) {
        case 'description':
        case 'og:description':
          response.description = tag.getAttribute('content');
          break;

        case 'image':
        case 'og:image':
          response.img = new URL(tag.getAttribute('content'), url).href;
          console.log('response.img', response.img);
          break; 
      }
    }); 

    return response;
  }
}

export default ExternalURL;