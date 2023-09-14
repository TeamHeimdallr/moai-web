export interface GnbMenu {
  id: string;
  text: string;
  path: string;
  disabled?: boolean;
  commingSoon?: boolean;
}

export interface ChainSelect {
  id: number;
  text: string;
  disabled?: boolean;
  commingSoon?: boolean;
}
