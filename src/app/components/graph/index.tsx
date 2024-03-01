import ForceGraph2D from 'react-force-graph-2d';
import { Graph } from 'ngraph.graph';
import fromDot from 'ngraph.fromdot';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonCard, IonCardContent } from '@ionic/react';
import { truncateB64ForGraph } from '../../utils/compat';

interface Node {
  id: number;
  group?: number;
  neighbors?: Node[];
  links?: Link[];
  label: string;
  ranking: number;
}

interface Link {
  source: number;
  target: number;
  value: number;
}

const NODE_R = 6;

const parseGraphDOT = (
  dotString: string,
  forKey: string,
  rankingFilter: number,
) => {
  const graph: Graph = fromDot(dotString);

  const nodes: Node[] = [];

  graph.forEachNode((node: any) => {
    const ranking = Number(node.data.ranking);
    const label = node.data.label as string;

    if (forKey !== label && rankingFilter / 100 > ranking) return;

    nodes.push({
      id: node.id,
      group: 1,
      label,
      ranking,
    });
  });

  const links: Link[] = [];
  graph.forEachLink((link: any) => {
    const source = link.fromId;
    const target = link.toId;

    if (!nodes.map((n) => n.id).includes(source)) return;
    if (!nodes.map((n) => n.id).includes(target)) return;

    links.push({
      source,
      target,
      value: Number(link.data.weight),
    });
  });
  return { nodes, links };
};

function RepresentationGraph({
  forKey,
  graphDOT,
  setForKey,
  colorScheme,
  tipHeight,
}: {
  forKey: string;
  graphDOT: string;
  setForKey: (pk: string) => void;
  colorScheme: 'light' | 'dark';
  tipHeight: number;
}) {
  const [rankingFilter] = useState<number>(0);

  const graphData = useMemo(() => {
    const { nodes, links } = parseGraphDOT(graphDOT, forKey, rankingFilter);

    return { nodes, links };
  }, [graphDOT, forKey, rankingFilter]);

  const handleNodeFocus = useCallback(
    (node: any) => {
      setForKey(node?.label);
    },
    [setForKey],
  );

  const handleNodeCanvasObject = useCallback(
    (node: any, ctx: any, globalScale: any) => {
      const label = truncateB64ForGraph(node.label);
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(
        (n) => n + fontSize * 0.2,
      ); // some padding

      ctx.fillStyle =
        colorScheme === 'light' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
      ctx.fillRect(
        node.x - bckgDimensions[0] / 2,
        node.y - bckgDimensions[1] / 2,
        bckgDimensions[0],
        bckgDimensions[1],
      );

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = colorScheme === 'light' ? '#ffffff' : '#000000';
      ctx.fillText(label, node.x, node.y);

      node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
    },
    [colorScheme],
  );

  const handleNodePointerAreaPaint = useCallback(
    (node: any, color: any, ctx: any) => {
      ctx.fillStyle = color;
      const bckgDimensions = node.__bckgDimensions;
      bckgDimensions &&
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          bckgDimensions[0],
          bckgDimensions[1],
        );
    },
    [],
  );

  const initialNode = useMemo(
    () => graphData.nodes.find((n) => n.label === forKey),
    [graphData.nodes, forKey],
  );

  useEffect(() => {
    handleNodeFocus(initialNode);
  }, [initialNode, handleNodeFocus]);

  const forceRef = useRef<any>();

  const weightRatio = (weight: number) => {
    if (tipHeight) {
      return (Number(weight) / Number(tipHeight)) * 50;
    }
    return Number(weight);
  };

  return (
    <>
      <IonCard>
        <IonCardContent>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <ForceGraph2D
              ref={forceRef}
              height={200}
              graphData={graphData}
              linkColor={() =>
                colorScheme === 'light' ? '#55e816' : '#FE650D'
              }
              nodeRelSize={NODE_R}
              autoPauseRedraw={false}
              linkWidth={(link) => 1}
              linkDirectionalParticles={(link) =>
                Math.log2(weightRatio(link.value) * 2)
              }
              linkDirectionalParticleSpeed={(link) =>
                Math.log2(weightRatio(link.value) * 2) * 0.001
              }
              nodeCanvasObject={handleNodeCanvasObject}
              nodePointerAreaPaint={handleNodePointerAreaPaint}
              onNodeClick={handleNodeFocus}
              cooldownTicks={100}
              onEngineStop={() => forceRef.current.centerAt([0], [0], [300])}
            />
          </div>
        </IonCardContent>
      </IonCard>
      {/* <IonCard>
        <IonCardHeader>
          <IonCardSubtitle>
            Showing {'>'} {rankingFilter}%
            <IonRange
              className="ion-margin-start"
              aria-label="filter-by"
              pin={true}
              pinFormatter={(value: number) => `${value}%`}
              onIonChange={({ detail }) => setRankingFilter(Number(detail.value))}
            ></IonRange>
          </IonCardSubtitle>
        </IonCardHeader>
      </IonCard> */}
    </>
  );
}

export default RepresentationGraph;
