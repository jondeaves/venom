/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/no-extraneous-dependencies */
import axios, { AxiosRequestConfig } from 'axios';
import cheerio from 'cheerio';

export async function getHTMLPage(url: string, config?: AxiosRequestConfig): Promise<CheerioStatic> {
  const res = await axios.get(url, config);
  return cheerio.load(res.data.toString());
}
