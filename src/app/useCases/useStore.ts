import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Imbalance, Graph, Ranking, Representation } from '../utils/appTypes';

interface SpaceState {
  representationsByPubKey: {
    [pubKey: string]: Representation[] | null | undefined;
  };
  setRepresentations: (
    publicKey: string,
    representations?: Representation[],
  ) => void;
  getRepresentations: (pubKey: string) => Representation[];
  imbalancesByPubKey: { [pubKey: string]: Imbalance | null | undefined };
  getImbalance: (pubKey: string) => Imbalance | null | undefined;
  setImbalance: (imbalance: Imbalance) => void;
  rankingsByPubKey: { [pubKey: string]: Ranking | null | undefined };
  getRanking: (pubKey: string) => Ranking | null | undefined;
  setRanking: (ranking: Ranking) => void;
  topRankings: Ranking[];
  getTopRankings: () => Ranking[];
  setTopRankings: (rankings: Ranking[]) => void;
  graphsByPubKey: { [pubKey: string]: Graph | null | undefined };
  getGraph: (pubKey: string) => Graph | null | undefined;
  setGraph: (graph: Graph) => void;
}

export const useSpaceStore = create<SpaceState>()(
  persist(
    (set, get) => ({
      representationsByPubKey: {},
      setRepresentations: (publicKey, representations = []) => {
        set((state) => ({
          representationsByPubKey: {
            ...state.representationsByPubKey,
            [publicKey]: representations,
          },
        }));
      },
      getRepresentations: (pubKey: string) =>
        get().representationsByPubKey[pubKey] ?? [],
      imbalancesByPubKey: {},
      getImbalance: (pubKey: string) => get().imbalancesByPubKey[pubKey],
      setImbalance: (imbalance) =>
        set((state) => ({
          imbalancesByPubKey: {
            ...state.imbalancesByPubKey,
            [imbalance.public_key]: imbalance,
          },
        })),
      rankingsByPubKey: {},
      getRanking: (pubKey: string) => get().rankingsByPubKey[pubKey],
      setRanking: (ranking) =>
        set((state) => ({
          rankingsByPubKey: {
            ...state.rankingsByPubKey,
            [ranking.public_key]: ranking,
          },
        })),
      topRankings: [],
      getTopRankings: () => get().topRankings,
      setTopRankings: (topRankings) =>
        set((state) => ({
          topRankings,
        })),
      graphsByPubKey: {},
      getGraph: (pubKey: string) => get().graphsByPubKey[pubKey],
      setGraph: (graph) =>
        set((state) => ({
          graphsByPubKey: {
            ...state.graphsByPubKey,
            [graph.public_key]: graph,
          },
        })),
    }),
    {
      name: 'space-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

interface KeyState {
  selectedKeyIndex: number;
  selectedKey: string;
  setSelectedKey: (selectedKey: string) => void;
  publicKeys: string[];
  setPublicKeys: (keys: string[]) => void;
}

export const useKeyStore = create<KeyState>()(
  persist(
    (set, get) => ({
      selectedKeyIndex: 0,
      selectedKey: '',
      setSelectedKey: (selectedKey: string) => {
        const selectedKeyIndex = get().publicKeys.indexOf(selectedKey);
        set(() => ({
          selectedKey,
          selectedKeyIndex,
        }));
      },
      publicKeys: [],
      setPublicKeys: (publicKeys: string[]) => {
        set(() => ({
          selectedKeyIndex: 0,
          selectedKey: publicKeys[0],
          publicKeys,
        }));
      },
    }),
    {
      name: 'key-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
