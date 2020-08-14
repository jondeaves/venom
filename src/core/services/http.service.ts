import { injectable } from 'inversify';
import Axios, { AxiosStatic, AxiosRequestConfig, AxiosResponse } from 'axios';

@injectable()
export default class HttpService {
  private _client: AxiosStatic;

  constructor() {
    this._client = Axios;
  }

  public async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this._client.get(url, config);
  }
}
