import { PageShell } from '../components/pageShell';
import { useKeyHolder } from '../useCases/useKeyHolder';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../utils/appContext';
import Graph from '../components/graph';
import KeyRankings from '../components/keyRankings';

const Space = ({ isInsider }: { isInsider?: boolean }) => {
  const { selectedKey } = useKeyHolder();

  const {
    colorScheme,
    tipHeader,
    requestTopRankings,
    topRankings,
    graph,
    requestGraph,
  } = useContext(AppContext);

  const tipHeight = tipHeader?.header.height ?? 0;

  const [peekGraphKey, setPeekGraphKey] = useState<string | null | undefined>();

  const whichKey =
    peekGraphKey ||
    selectedKey ||
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (whichKey) {
        requestGraph(whichKey);
      }
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [whichKey, requestGraph]);

  useEffect(() => {
    const resultHandler = (data: any) => {
      if (whichKey && data.detail) {
        requestGraph(whichKey);
      }
    };

    document.addEventListener('inv_plot', resultHandler);

    return () => {
      document.removeEventListener('inv_plot', resultHandler);
    };
  }, [whichKey, requestGraph]);

  const graphDOT = graph(whichKey)?.graph!;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      requestTopRankings([]);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [requestTopRankings]);

  return (
    <PageShell
      renderBody={() => (
        <>
          {!!whichKey && (
            <>
              {isInsider && !!graphDOT && (
                <Graph
                  tipHeight={tipHeight}
                  forKey={whichKey}
                  graphDOT={graphDOT}
                  setForKey={setPeekGraphKey}
                  colorScheme={colorScheme}
                />
              )}
              <KeyRankings
                filterKeyPairs={!isInsider}
                keyRankings={topRankings()}
                selectedKey={whichKey}
                setSelectedKey={setPeekGraphKey}
              />
            </>
          )}
        </>
      )}
    />
  );
};

export default Space;
