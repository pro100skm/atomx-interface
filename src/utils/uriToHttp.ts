/**
 * Given a URI that may be ipfs, ipns, http, https, or data protocol, return the fetch-able http(s) URLs for the same content
 * @param uri to convert to fetch-able http url
 */
export default function uriToHttp(uri: string): string[] {
  const protocol = uri.split(':')[0].toLowerCase();
  let temp;
  switch (protocol) {
    case 'data':
      return [uri];
    case 'https':
      return [uri];
    case 'http':
      return ['https' + uri.substr(4), uri];
    case 'ipfs':
      temp = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
      return [`https://cloudflare-ipfs.com/ipfs/${temp}/`, `https://ipfs.io/ipfs/${temp}/`];
    case 'ipns':
      temp = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
      return [`https://cloudflare-ipfs.com/ipns/${temp}/`, `https://ipfs.io/ipns/${temp}/`];
    case 'ar':
      temp = uri.match(/^ar:(\/\/)?(.*)$/i)?.[2];
      return [`https://arweave.net/${temp}`];
    default:
      return [];
  }
}
