import 'axios';

declare module 'axios' {
  export interface AxiosResponse<T = any, D = any> {
    data: {
      success: boolean;
      data: T;
      message: string;
    };
  }
}
export {}