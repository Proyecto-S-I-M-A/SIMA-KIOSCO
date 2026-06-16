export interface LoginData {
  username?: string;
  password?: string;
  email?: string;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  session?: {
    access_token: string;
    refresh_token: string;
  };
}
