import { Service } from 'alpha-dic';
import Axios, { AxiosStatic, AxiosRequestConfig, AxiosResponse } from 'axios';

@Service('HttpService')
export default class HttpService {
  private _client: AxiosStatic;

  constructor() {
    this._client = Axios;
  }

  public async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this._client.get(url, config);
  }
}
