export interface GitHubPREvent {
  action: string;
  pull_request: {
    id: number;
    number: number;
    title: string;
    body: string | null;
    merged: boolean;
    html_url: string;
    user: {
      login: string;
    };
    head: {
      repo: {
        name: string;
        owner: {
          login: string;
        }
      }
    }
  };
  repository: {
    full_name: string;
  };
}

export interface PrEventRecord {
  id?: number;
  pr_id: number;
  repo_name: string;
  author: string;
  title: string;
  summary: string;
  created_at: string;
}
