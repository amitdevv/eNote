export type Highlight = {
  id: string;
  user_id: string;
  name: string;
  color: string; // hex
  created_at: string;
  updated_at: string;
};

export type HighlightInsert = { name: string; color: string };
export type HighlightUpdate = { name?: string; color?: string };
