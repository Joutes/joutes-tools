export type Game = {
  id: string;
  slug?: string;
  icon?: string | null;
  banner?: string | null;
  description?: string;
  name: string;
  defaultSet?: string;
  defaultBoosterType?: string;
};
