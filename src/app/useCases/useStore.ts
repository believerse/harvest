import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Imbalance, Graph, Rank, Interaction } from '../utils/appTypes';

interface SpaceState {
  interactionsByPubKey: { [pubKey: string]: Interaction[] | null | undefined };
  setInteractions: (publicKey: string, interactions?: Interaction[]) => void;
  getInteractions: (pubKey: string) => Interaction[];
  imbalancesByPubKey: { [pubKey: string]: Imbalance | null | undefined };
  getImbalance: (pubKey: string) => Imbalance | null | undefined;
  setImbalance: (imbalance: Imbalance) => void;
  ranksByPubKey: { [pubKey: string]: Rank | null | undefined };
  getRank: (pubKey: string) => Rank | null | undefined;
  setRank: (rank: Rank) => void;
  graphsByPubKey: { [pubKey: string]: Graph | null | undefined };
  getGraph: (pubKey: string) => Graph | null | undefined;
  setGraph: (graph: Graph) => void;
}

export const useSpaceStore = create<SpaceState>()(
  persist(
    (set, get) => ({
      interactionsByPubKey: {},
      setInteractions: (publicKey, interactions = []) => {
        set((state) => ({
          interactionsByPubKey: {
            ...state.interactionsByPubKey,
            [publicKey]: interactions,
          },
        }));
      },
      getInteractions: (pubKey: string) =>
        get().interactionsByPubKey[pubKey] ?? [],
      imbalancesByPubKey: {},
      getImbalance: (pubKey: string) => get().imbalancesByPubKey[pubKey],
      setImbalance: (imbalance) =>
        set((state) => ({
          imbalancesByPubKey: {
            ...state.imbalancesByPubKey,
            [imbalance.public_key]: imbalance,
          },
        })),
      ranksByPubKey: {},
      getRank: (pubKey: string) => get().ranksByPubKey[pubKey],
      setRank: (rank) =>
        set((state) => ({
          ranksByPubKey: {
            ...state.ranksByPubKey,
            [rank.public_key]: rank,
          },
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
