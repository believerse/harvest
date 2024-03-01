import { createContext } from 'react';
import {
  Imbalance,
  Plot,
  PlotIdHeaderPair,
  Rank,
  Graph,
  Interaction,
} from '../utils/appTypes';

interface AppState {
  publicKeys: string[];
  setPublicKeys: (keys: string[]) => void;
  selectedKeyIndex: number;
  selectedKey: string;
  setSelectedKey: (key: string) => void;
  requestTipHeader: () => void;
  tipHeader?: PlotIdHeaderPair;
  setTipHeader: (tipHeader: PlotIdHeaderPair) => void;
  requestPlotByHeight: (height: number) => void;
  requestPlotById: (plot_id: string) => void;
  currentPlot?: Plot | null;
  setCurrentPlot: (currentPlot: Plot) => void;
  genesisPlot?: Plot | null;
  setGenesisPlot: (genesisPlot: Plot) => void;
  requestImbalance: (publicKeyB64: string) => void;
  imbalance: (pubKey: string) => Imbalance | null | undefined;
  setImbalance: (imbalance: Imbalance) => void;
  requestRank: (publicKeyB64: string) => void;
  rank: (pubKey: string) => Rank | null | undefined;
  setRank: (rank: Rank) => void;
  requestGraph: (publicKeyB64: string) => void;
  graph: (pubKey: string) => Graph | null | undefined;
  setGraph: (rank: Graph) => void;
  requestPkInteractions: (publicKeyB64: string) => void;
  pkInteractions: (pubKey: string) => Interaction[];
  setPkInteractions: (
    publicKey: string,
    interactions?: Interaction[] | undefined,
  ) => void;
  pushInteraction: (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: number,
  ) => Promise<void>;

  requestPendingInteractions: (publicKeyB64: string) => void;
  pendingInteractions: Interaction[];
  setPendingInteractions: (txns: Interaction[]) => void;
  selectedNode: string;
  setSelectedNode: (node: string) => void;
  colorScheme: 'light' | 'dark';
}

export const AppContext = createContext<AppState>({
  publicKeys: [],
  setPublicKeys: () => {},
  selectedKeyIndex: 0,
  selectedKey: '',
  setSelectedKey: () => {},
  tipHeader: undefined,
  requestTipHeader: () => {},
  setTipHeader: () => {},
  requestPlotById: (plot_id: string) => {},
  requestPlotByHeight: (height: number) => {},
  currentPlot: undefined,
  setCurrentPlot: (currentPlot: Plot) => {},
  genesisPlot: undefined,
  setGenesisPlot: (genesisPlot: Plot) => {},
  requestImbalance: (publicKeyB64: string) => {},
  imbalance: () => null,
  setImbalance: () => {},
  requestRank: (publicKeyB64: string) => {},
  rank: () => null,
  setRank: () => {},
  requestGraph: (publicKeyB64: string) => {},
  graph: () => null,
  setGraph: () => {},
  requestPkInteractions: (publicKeyB64: string) => {},
  pkInteractions: () => [],
  setPkInteractions: () => {},
  requestPendingInteractions: () => {},
  pendingInteractions: [],
  setPendingInteractions: () => {},
  selectedNode: '',
  setSelectedNode: () => {},
  colorScheme: 'light',
  pushInteraction: (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: number,
  ) => Promise.resolve(),
});
