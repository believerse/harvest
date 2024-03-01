import { createContext } from 'react';
import {
  Imbalance,
  Plot,
  PlotIdHeaderPair,
  Ranking,
  Graph,
  Representation,
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
  requestRanking: (publicKeyB64: string) => void;
  ranking: (pubKey: string) => Ranking | null | undefined;
  setRanking: (ranking: Ranking) => void;
  requestTopRankings: (publicKeysB64: string[]) => void;
  topRankings: () => Ranking[];
  setTopRankings: (rankings: Ranking[]) => void;
  requestGraph: (publicKeyB64: string) => void;
  graph: (pubKey: string) => Graph | null | undefined;
  setGraph: (ranking: Graph) => void;
  requestPkRepresentations: (publicKeyB64: string) => void;
  pkRepresentations: (pubKey: string) => Representation[];
  setPkRepresentations: (
    publicKey: string,
    representations?: Representation[] | undefined,
  ) => void;
  pushRepresentation: (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: number,
  ) => Promise<void>;

  requestPendingRepresentations: (publicKeyB64: string) => void;
  pendingRepresentations: Representation[];
  setPendingRepresentations: (txns: Representation[]) => void;
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
  requestRanking: (publicKeyB64: string) => {},
  ranking: () => null,
  setRanking: () => {},
  requestTopRankings: (publicKeyB64: string[]) => {},
  topRankings: () => [],
  setTopRankings: () => {},
  requestGraph: (publicKeyB64: string) => {},
  graph: () => null,
  setGraph: () => {},
  requestPkRepresentations: (publicKeyB64: string) => {},
  pkRepresentations: () => [],
  setPkRepresentations: () => {},
  requestPendingRepresentations: () => {},
  pendingRepresentations: [],
  setPendingRepresentations: () => {},
  selectedNode: '',
  setSelectedNode: () => {},
  colorScheme: 'light',
  pushRepresentation: (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: number,
  ) => Promise.resolve(),
});
