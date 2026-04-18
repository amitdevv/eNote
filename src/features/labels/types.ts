export type Label = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export type LabelInsert = {
  name: string;
  color: string;
};
export type LabelUpdate = {
  name?: string;
  color?: string;
};
