export interface GnbMenu {
  id: string;
  text: string;
  path: string;
  disabled?: boolean;
  commingSoon?: boolean;
}

export interface ChainSelectList {
  name: string;
  text: string;
  show?: boolean;
  disabled?: boolean;
  commingSoon?: boolean;
}
