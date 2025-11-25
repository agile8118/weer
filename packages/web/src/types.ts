import type { LinkType } from "@weer/common";

export interface IUrl {
  id: string;
  real_url: string;
  code: string;
  link_type: LinkType;
  expires_at?: string;
}
