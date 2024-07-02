import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import {
  expandOutline,
  gridOutline,
  contractOutline,
  ellipseOutline,
  triangleOutline,
  squareOutline,
} from 'ionicons/icons';
import Cross from './pages/cross';
import Time from './pages/time';
import Space from './pages/space';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { useState, useEffect } from 'react';

import { useSpaceStore, useKeyStore } from './useCases/useStore';

import { AppContext } from './utils/appContext';
import { Representation, Plot, PlotIdHeaderPair } from './utils/appTypes';
import { usePersistentState } from './useCases/usePersistentState';

import { useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { signRepresentation } from './useCases/useKeyHolder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HackIonReactRouter = IonReactHashRouter as any;

setupIonicReact();

const App: React.FC = () => {
  const publicKeys = useKeyStore((state) => state.publicKeys);
  const setPublicKeys = useKeyStore((state) => state.setPublicKeys);
  const selectedKeyIndex = useKeyStore((state) => state.selectedKeyIndex);
  const selectedKey = useKeyStore((state) => state.selectedKey);
  const setSelectedKey = useKeyStore((state) => state.setSelectedKey);

  const [tipHeader, setTipHeader] = useState<PlotIdHeaderPair>();
  const [currentPlot, setCurrentPlot] = usePersistentState<Plot | null>(
    'current-plot',
    null,
  );

  const [genesisPlot, setGenesisPlot] = usePersistentState<Plot | null>(
    'genesis-plot',
    null,
  );

  const ranking = useSpaceStore((state) => state.getRanking);
  const setRanking = useSpaceStore((state) => state.setRanking);

  const topRankings = useSpaceStore((state) => state.getTopRankings);
  const setTopRankings = useSpaceStore((state) => state.setTopRankings);

  const graph = useSpaceStore((state) => state.getGraph);
  const setGraph = useSpaceStore((state) => state.setGraph);

  const imbalance = useSpaceStore((state) => state.getImbalance);
  const setImbalance = useSpaceStore((state) => state.setImbalance);

  const pkRepresentations = useSpaceStore((state) => state.getRepresentations);
  const setPkRepresentations = useSpaceStore(
    (state) => state.setRepresentations,
  );

  const [pendingRepresentations, setPendingRepresentations] = useState<
    Representation[]
  >([]);

  const [selectedNode, setSelectedNode] = usePersistentState(
    'selected-node',
    '',
  );

  const { sendJsonMessage, readyState } = useWebSocket(
    `wss://${selectedNode}`,
    {
      protocols: ['plotthread.1'],
      onOpen: () => console.log('opened', selectedNode),
      onError: () => console.log('errored', selectedNode),
      shouldReconnect: () => true,
      share: true,
      onMessage: (event) => {
        const { type, body } = JSON.parse(event.data);

        switch (type) {
          case 'inv_plot':
            document.dispatchEvent(
              new CustomEvent<{
                representation_id: string;
                error: string;
              }>('inv_plot', { detail: body.plot_ids }),
            );
            requestTipHeader();
            break;
          case 'tip_header':
            setTipHeader(body);
            break;
          case 'imbalance':
            setImbalance(body);
            break;
          case 'ranking':
            setRanking(body);
            break;
          case 'rankings':
            setTopRankings(
              body.rankings.map(
                ({
                  public_key,
                  ranking,
                }: {
                  public_key: string;
                  ranking: number;
                }) => ({
                  plot_id: body.plot_id,
                  height: body.height,
                  public_key,
                  ranking,
                }),
              ),
            );
            break;
          case 'graph':
            setGraph(body);
            break;
          case 'plot':
            if (body.plot.header.height === 0) {
              setGenesisPlot(body.plot);
            }
            setCurrentPlot(body.plot);
            break;
          case 'push_representation_result':
            document.dispatchEvent(
              new CustomEvent<{
                representation_id: string;
                error: string;
              }>('push_representation_result', { detail: body }),
            );
            break;
          case 'public_key_representations':
            setPkRepresentations(
              body.public_key,
              body.filter_plots?.flatMap((i: any) => i.representations) ?? [],
            );
            document.dispatchEvent(
              new CustomEvent<string>('public_key_representations', {
                detail: body.public_key,
              }),
            );
            break;
          case 'filter_representation_queue':
            setPendingRepresentations(body.representations);
            break;
        }
      },
    },
  );

  const requestPlotById = useCallback(
    (plot_id: string) => {
      if (readyState !== ReadyState.OPEN) return;
      sendJsonMessage({
        type: 'get_plot',
        body: { plot_id },
      });
    },
    [readyState, sendJsonMessage],
  );

  const requestPlotByHeight = useCallback(
    (height: number) => {
      if (readyState !== ReadyState.OPEN) return;
      sendJsonMessage({
        type: 'get_plot_by_height',
        body: { height },
      });
    },
    [readyState, sendJsonMessage],
  );

  const requestTipHeader = useCallback(() => {
    if (readyState !== ReadyState.OPEN) return;
    sendJsonMessage({ type: 'get_tip_header' });
  }, [readyState, sendJsonMessage]);

  const requestImbalance = useCallback(
    (publicKeyB64: string) => {
      if (readyState !== ReadyState.OPEN) return;
      if (!publicKeyB64) throw new Error('missing publicKey');

      sendJsonMessage({
        type: 'get_imbalance',
        body: {
          public_key: publicKeyB64,
        },
      });
    },
    [readyState, sendJsonMessage],
  );

  const requestRanking = useCallback(
    (publicKeyB64: string) => {
      if (readyState !== ReadyState.OPEN) return;
      if (!publicKeyB64) throw new Error('missing publicKey');

      sendJsonMessage({
        type: 'get_ranking',
        body: {
          public_key: publicKeyB64,
        },
      });
    },
    [readyState, sendJsonMessage],
  );

  const requestTopRankings = useCallback(() => {
    if (readyState !== ReadyState.OPEN) return;

    sendJsonMessage({
      type: 'get_rankings',
      body: {
        public_keys: [],
      },
    });
  }, [readyState, sendJsonMessage]);

  const requestGraph = useCallback(
    (publicKeyB64: string) => {
      if (readyState !== ReadyState.OPEN) return;
      if (!publicKeyB64) throw new Error('missing publicKey');

      sendJsonMessage({
        type: 'get_graph',
        body: {
          public_key: publicKeyB64,
        },
      });
    },
    [readyState, sendJsonMessage],
  );

  const pushRepresentation = async (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: number,
  ) => {
    if (readyState !== ReadyState.OPEN) return;
    if (to && memo && tipHeader?.header.height && publicKeys.length) {
      const representation = await signRepresentation(
        to,
        memo,
        tipHeader?.header.height,
        selectedKeyIndex,
        passphrase,
      );

      if (!representation) return;

      sendJsonMessage({
        type: 'push_representation',
        body: {
          representation,
        } as any,
      });
    }
  };

  const requestPkRepresentations = useCallback(
    (publicKeyB64: string) => {
      if (readyState !== ReadyState.OPEN) return;
      if (!publicKeyB64) throw new Error('missing publicKey');

      //TODO: skip if exists in cache
      //allow user to explicitly refresh

      if (tipHeader?.header.height) {
        sendJsonMessage({
          type: 'get_public_key_representations',
          body: {
            public_key: publicKeyB64,
            start_height: tipHeader?.header.height + 1,
            end_height: 0,
            limit: 10,
          },
        });
      }
    },
    [readyState, sendJsonMessage, tipHeader],
  );

  const applyFilter = useCallback(
    (publicKeysB64: string[]) => {
      if (readyState !== ReadyState.OPEN) return;
      if (publicKeysB64.length) {
        sendJsonMessage({
          type: 'filter_add',
          body: {
            public_keys: publicKeysB64,
          },
        });
      }
    },
    [readyState, sendJsonMessage],
  );

  const requestPendingRepresentations = useCallback(
    (publicKeyB64: string) => {
      if (readyState !== ReadyState.OPEN) return;
      //applyFilter must be called first with a public key
      applyFilter([publicKeyB64]);
      sendJsonMessage({
        type: 'get_filter_representation_queue',
      });
    },
    [readyState, applyFilter, sendJsonMessage],
  );

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    prefersDark.matches ? 'dark' : 'light',
  );

  useEffect(() => {
    const eventHandler = (mediaQuery: MediaQueryListEvent) =>
      setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    prefersDark.addEventListener('change', eventHandler);

    return () => {
      prefersDark.removeEventListener('change', eventHandler);
    };
  }, [prefersDark, setColorScheme]);

  const appState = {
    publicKeys,
    setPublicKeys,
    selectedKeyIndex,
    selectedKey,
    setSelectedKey,
    requestTipHeader,
    tipHeader,
    setTipHeader,
    requestPlotById,
    requestPlotByHeight,
    currentPlot,
    setCurrentPlot,
    genesisPlot,
    setGenesisPlot,
    requestImbalance,
    imbalance,
    setImbalance,
    requestRanking,
    ranking,
    setRanking,
    requestTopRankings,
    topRankings,
    setTopRankings,
    requestGraph,
    graph,
    setGraph,
    pushRepresentation,
    requestPkRepresentations,
    pkRepresentations,
    setPkRepresentations,
    requestPendingRepresentations,
    pendingRepresentations,
    setPendingRepresentations,
    selectedNode,
    setSelectedNode,
    colorScheme,
  };

  useEffect(() => {
    //First load
    if (!!selectedNode) {
      requestTipHeader();
    }
  }, [selectedNode, requestTipHeader]);

  return (
    <AppContext.Provider value={appState}>
      <IonApp>
        <HackIonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/">
              <Space />
            </Route>
            <Route exact path="/book">
              <Space />
            </Route>
            <Route exact path="/time">
              <Main colorScheme={colorScheme} />
            </Route>
            <Route exact path="/space">
              <Main colorScheme={colorScheme} />
            </Route>
            <Route exact path="/cross">
              <Main colorScheme={colorScheme} />
            </Route>
          </IonRouterOutlet>
        </HackIonReactRouter>
      </IonApp>
    </AppContext.Provider>
  );
};

const Main = ({ colorScheme }: { colorScheme: string }) => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/time">
        <Time />
      </Route>
      <Route exact path="/space">
        <Space />
      </Route>
      <Route exact path="/cross">
        <Cross />
      </Route>
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="time" href="/time">
        <IonIcon
          aria-hidden="true"
          icon={colorScheme === 'light' ? expandOutline : ellipseOutline}
        />
      </IonTabButton>
      <IonTabButton tab="cross" href="/cross">
        <IonIcon
          aria-hidden="true"
          icon={colorScheme === 'light' ? contractOutline : triangleOutline}
        />
      </IonTabButton>
      <IonTabButton tab="space" href="/space">
        <IonIcon
          aria-hidden="true"
          icon={colorScheme === 'light' ? gridOutline : squareOutline}
        />
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default App;
