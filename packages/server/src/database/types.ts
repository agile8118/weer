import type { LinkType } from "@weer/common";

export type TTables = "users" | "urls" | "ultra_codes" | "sessions";

export interface IUser {
  id: string;
  google_id?: string;
  username?: string;
  email?: string;
  name?: string;
  password?: string;
  verified?: boolean;
  token_code?: string;
  token_date?: Date;
  updated_at: Date;
  created_at: Date;
}

export interface IUrl {
  id: number;
  real_url: string;
  shortened_url_id: string;
  qr_code_id: string;
  user_id?: number;
  session_id?: number;
  is_on_username: boolean;
  link_type: LinkType;
  views: number;
  updated_at: Date;
  created_at: Date;
}

export interface IUltraCode {
  id: number;
  code: string;
  url_id?: number;
  expires_at?: Date;
  assigned_at: Date;
}

export interface ISession {
  id: number;
  session_token: string;
  data: object;
  created_at: Date;
  last_active: Date;
  expires_at: Date;
}
