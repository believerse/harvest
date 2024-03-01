export interface Imbalance {
  public_key: string;
  imbalance: number;
  plot_id?: string;
  height?: number;
  error?: string;
}

export interface Ranking {
  public_key: string;
  ranking: number;
  plot_id?: string;
  height?: number;
  error?: string;
}

export interface Graph {
  public_key: string;
  graph?: string;
  plot_id?: string;
  height?: number;
}

export interface PlotHeader {
  previous: string;
  hash_list_root: string;
  time: number;
  target: string;
  thread_work: string;
  nonce: number;
  height: number;
  representation_count: number;
}

export interface PlotIdHeaderPair {
  plot_id: string;
  header: PlotHeader;
}

export interface Plot {
  header: PlotHeader;
  representations: Representation[];
}

export interface Representation {
  from: string;
  to: string;
  memo: string;
  time: number;
  nonce?: number;
  series?: number;
  signature?: string;
}
