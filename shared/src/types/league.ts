export interface League {
  name: string;
  slug: string;
  ownerId: string;
  inviteCode?: string;
  createdAt: number;
  description?: string;
  imageURL?: string;
}

export interface LeagueWithId extends League {
  id: string;
  memberCount?: number;
}

export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
