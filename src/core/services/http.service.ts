import Axios, { AxiosStatic, AxiosRequestConfig, AxiosResponse } from 'axios';

import LoggerService from './logger.service';

export default class HttpService {
  private _client: AxiosStatic;

  constructor(private _loggerService: LoggerService) {
    this._client = Axios;
  }

  public async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    this._loggerService.log('debug', 'Sending HTTP GET', {
      url,
      config,
    });

    return this._client.get(url, config);
  }
}
