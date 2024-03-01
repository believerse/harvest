import ForceGraph2D from 'react-force-graph-2d';
import { Graph } from 'ngraph.graph';
import fromDot from 'ngraph.fromdot';
import { useCallback, useMemo, useRef, useState } from 'react';
import KeyViewer from '../keyViewer';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonRange,
} from '@ionic/react';
import { locateOutline } from 'ionicons/icons';
import { shortenB64 } from '../../utils/compat';

interface Node {
  id: number;
  group?: number;
  neighbors?: Node[];
  links?: Link[];
  label: string;
  rank: number;
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
  rankFilter: number,
) => {
  const graph: Graph = fromDot(dotString);

  const nodes: Node[] = [];

  graph.forEachNode((node: any) => {
    const rank = Number(node.data.rank);
    const label = node.data.label as string;

    if (forKey !== label && rankFilter / 100 > rank) return;

    nodes.push({
      id: node.id,
      group: 1,
      label,
      rank,
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

function InteractionGraph({
  forKey,
  graphDOT,
  peekGraph,
  clearPeek,
  colorScheme,
}: {
  forKey: string;
  graphDOT: string;
  peekGraph: (pk: string) => void;
  clearPeek: () => void;
  colorScheme: 'light' | 'dark';
}) {
  const [rankFilter, setRankFilter] = useState<number>(0);

  const graphData = useMemo(() => {
    const { nodes, links } = parseGraphDOT(graphDOT, forKey, rankFilter);
    // cross-link node objects
    links.forEach((link: Link) => {
      const a = nodes.find((n) => n.id === link.source)!;
      const b = nodes.find((n) => n.id === link.target)!;

      !a?.neighbors && (a.neighbors = []);
      !b?.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a?.links && (a.links = []);
      !b?.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });

    return { nodes, links };
  }, [graphDOT, forKey, rankFilter]);

  const [highlightNodes, setHighlightNodes] = useState(new Set<Node>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<Link>());
  const [focusNode, setFocusNode] = useState<Node | null | undefined>(null);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeFocus = (node: any) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors?.forEach((neighbor: any) => highlightNodes.add(neighbor));
      node.links?.forEach((link: any) => highlightLinks.add(link));
    }

    setFocusNode(node || null);
    updateHighlight();
  };

  const handleLinkFocus = (link: any) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  const paintRing = useCallback(
    (node: any, ctx: any) => {
      // add ring just for highlighted nodes
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
      if (colorScheme === 'light') {
        ctx.fillStyle = node === focusNode ? '#0df03a' : '#68ee2f';
      } else {
        ctx.fillStyle = node === focusNode ? '#f80713' : '#fa3a43';
      }

      ctx.fill();
    },
    [focusNode, colorScheme],
  );

  const reset = () => {
    handleNodeFocus(null);
    clearPeek();
  };

  const forceRef = useRef<any>();

  return (
    <>
      <IonCard>
        <IonCardHeader>
          {focusNode ? (
            <span>
              <KeyViewer value={focusNode.label} />
              <IonChip
                className="ion-margin-start"
                onClick={() => peekGraph(focusNode.label)}
              >
                Peek
              </IonChip>
              <IonChip className="ion-margin-start" onClick={reset}>
                Clear
              </IonChip>
            </span>
          ) : (
            <IonCardTitle className="ion-margin-top">
              Your Interactions
            </IonCardTitle>
          )}
          <IonRange
            aria-label="Range with pin"
            pin={true}
            pinFormatter={(value: number) => `${value}%`}
            onIonChange={({ detail }) => setRankFilter(Number(detail.value))}
          ></IonRange>
        </IonCardHeader>
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
              height={350}
              graphData={graphData}
              //nodeLabel={(node) => shortenB64(node.label)}
              nodeColor={() =>
                colorScheme === 'light' ? '#55e816' : '#FE650D'
              }
              linkColor={() =>
                colorScheme === 'light' ? '#39de144a' : '#ffc01f66'
              }
              nodeRelSize={NODE_R}
              autoPauseRedraw={false}
              linkWidth={(link) => (highlightLinks.has(link) ? 5 : 1)}
              linkDirectionalParticles={(link) =>
                Math.log2(Number((link.value > 100 ? 100 : link.value) * 2))
              }
              linkDirectionalParticleSpeed={(link) =>
                Math.log2(Number((link.value > 100 ? 100 : link.value) * 2)) *
                0.001
              }
              nodeCanvasObjectMode={(node) =>
                highlightNodes.has(node) ? 'before' : undefined
              }
              nodeCanvasObject={paintRing}
              onNodeClick={handleNodeFocus}
              onLinkClick={handleLinkFocus}
              onBackgroundClick={reset}
            />
          </div>
          <IonButton onClick={() => forceRef.current.centerAt([0], [0], [300])}>
            <IonIcon slot="icon-only" icon={locateOutline}></IonIcon>
          </IonButton>
        </IonCardContent>
      </IonCard>
    </>
  );
}

export default InteractionGraph;
