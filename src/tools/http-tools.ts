/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import cheerio from 'cheerio';

export async function getHTMLPage(url: string): Promise<CheerioStatic> {
  const res = await axios.get(url, {
    headers: {
      'Cookie':
        'asylum_session_id=15eff7783e58d06c778cd6bb6325f646; asylum_ipb_stronghold=abd5aa53bfd60af5d47195b4c1414816; asylum_member_id=1136; asylum_pass_hash=bab4442d4659cc06bd51c5ded5f2c7fd; asylum_coppa=0',
    }
  });
  return cheerio.load(res.data.toString());
}
