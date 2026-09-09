export type Priority = "alta" | "media" | "baja";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
  is_admin: boolean;
  can_manage_tasks: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null; // 'YYYY-MM-DD'
  assignee_id: string | null;
  department: string | null;
  next_action: string | null;
  done: boolean;
  done_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskWithAssignee = Task & {
  assignee: Pick<Profile, "id" | "full_name" | "role"> | null;
};

export type Comment = {
  id: string;
  task_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
  author?: Pick<Profile, "id" | "full_name"> | null;
};

export type ResourceLink = { label: string; url: string };

export type ResourceTable = { columns: string[]; rows: string[][] };

export type Board = "contenido" | "accesos" | "updates";

export type Resource = {
  id: string;
  board: Board;
  title: string;
  description: string | null;
  links: ResourceLink[];
  table_data: ResourceTable | null;
  image_url: string | null;
  category: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialPost = {
  id: string;
  publish_date: string | null;
  category: string | null;
  objective: string | null;
  product: string | null;
  status: string | null;
  link: string | null;
  content: string | null;
  copy: string | null;
  script: string | null;
  content_raw: string | null;
  content_edited: string | null;
  newsletter: string | null;
  kind: string | null; // 'publicacion' | 'story'
  format: string | null; // 'Reel' | 'Carrusel' | 'Post' | 'Story'
  inspiration: string | null;
  created_at: string;
  updated_at: string;
};

export type PostComment = {
  id: string;
  post_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
  author?: { id: string; full_name: string } | null;
};

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  task_id: string | null;
  post_id: string | null;
  comment_id: string | null;
  type: string;
  read: boolean;
  created_at: string;
  actor?: { full_name: string } | null;
  task?: { title: string } | null;
  post?: { category: string | null; copy: string | null } | null;
};
