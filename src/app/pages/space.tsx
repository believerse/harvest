import { IonIcon, IonText, useIonActionSheet } from '@ionic/react';
import { PageShell } from '../components/pageShell';
import { useKeyHolder } from '../useCases/useKeyHolder';
import { useContext, useEffect, useState } from 'react';
import { ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import type { OverlayEventDetail } from '@ionic/core';
import KeyHolder from '../components/keyHolder';
import { ImportKeyHolder } from '../components/importKeyHolder';
import { AppContext } from '../utils/appContext';
import Graph from '../components/graph';

const Space = () => {
  const {
    selectedKey,
    publicKeys,
    setSelectedKey,
    importKeyHolder,
    deleteKeyHolder,
  } = useKeyHolder();

  const {
    colorScheme,
    imbalance,
    requestImbalance,
    rank,
    requestRank,
    graph,
    requestGraph,
  } = useContext(AppContext);

  const pubKeyImbalance = imbalance(selectedKey)?.imbalance;

  const pubKeyRank = rank(selectedKey)?.rank;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (selectedKey) {
        requestImbalance(selectedKey);
        requestRank(selectedKey);
        requestGraph(selectedKey);
      }
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedKey, requestImbalance, requestRank, requestGraph]);

  useEffect(() => {
    const resultHandler = (data: any) => {
      if (selectedKey && data.detail) {
        requestImbalance(selectedKey);
        requestRank(selectedKey);
        requestGraph(selectedKey);
      }
    };

    document.addEventListener('inv_plot', resultHandler);

    return () => {
      document.removeEventListener('inv_plot', resultHandler);
    };
  }, [selectedKey, requestImbalance, requestRank, requestGraph]);

  const [presentActionSheet] = useIonActionSheet();

  const handleActionSheet = ({ data, role }: OverlayEventDetail) => {
    if (data?.['action'] === 'delete') {
      deleteKeyHolder();
    }
  };

  const [peekGraphKey, setPeekGraphKey] = useState<string | null | undefined>();
  const peekGraph = (pk: string) => {
    requestGraph(pk);
    setPeekGraphKey(pk);
  };
  const clearPeekGraph = () => {
    setPeekGraphKey(null);
  };

  const graphDOT = graph(peekGraphKey ?? selectedKey)?.graph!;

  return (
    <PageShell
      tools={[
        {
          label: 'action sheet',
          renderIcon: () => (
            <IonIcon
              slot="icon-only"
              ios={ellipsisHorizontal}
              md={ellipsisVertical}
            ></IonIcon>
          ),
          action: () =>
            presentActionSheet({
              onDidDismiss: ({ detail }) => handleActionSheet(detail),
              header: 'Actions',
              buttons: [
                {
                  text: 'Delete keyholder',
                  role: 'destructive',
                  data: {
                    action: 'delete',
                  },
                },
                {
                  text: 'Cancel',
                  role: 'cancel',
                  data: {
                    action: 'cancel',
                  },
                },
              ],
            }),
        },
      ]}
      renderBody={() => (
        <>
          {!selectedKey && (
            <ImportKeyHolder importKeyholder={importKeyHolder} />
          )}
          {!!selectedKey && (
            <>
              <section className="ion-padding">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <KeyHolder
                    setSelectedKey={setSelectedKey}
                    selectedKey={selectedKey}
                    publicKeys={publicKeys}
                  />
                </div>
                {pubKeyRank !== undefined && (
                  <IonText color="primary">
                    <p>
                      <strong>Interactivity: </strong>
                      <i>{Number((pubKeyRank / 1) * 100).toFixed(2)}%</i>
                    </p>
                  </IonText>
                )}
                {pubKeyImbalance !== undefined && (
                  <IonText color="primary">
                    <p>
                      <strong>Imbalance: </strong>
                      <i>
                        {pubKeyImbalance}{' '}
                        {colorScheme === 'light' ? 'seeds' : 'sparks'}
                      </i>
                    </p>
                  </IonText>
                )}
              </section>
              {!!graphDOT && (
                <Graph
                  forKey={peekGraphKey ?? selectedKey}
                  graphDOT={graphDOT}
                  peekGraph={peekGraph}
                  clearPeek={clearPeekGraph}
                  colorScheme={colorScheme}
                />
              )}
            </>
          )}
        </>
      )}
    />
  );
};

export default Space;
