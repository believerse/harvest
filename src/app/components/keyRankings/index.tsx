import {
  IonBadge,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
} from '@ionic/react';
import { listOutline } from 'ionicons/icons';
import KeyViewer from '../keyViewer';

const KeyRankings = ({
  keyRankings,
  selectedKey,
  setSelectedKey,
}: {
  selectedKey: string;
  keyRankings: { label: string; ranking: number }[];
  setSelectedKey: (key: string) => void;
}) => {
  const forKey = keyRankings.find((k) => k.label === selectedKey);
  return (
    <IonList>
      <section className="ion-content-scroll-host">
        <IonItem lines="none" button>
          <IonLabel>
            <KeyViewer value={selectedKey} />
          </IonLabel>
          <IonBadge slot="end">
            {Number((forKey?.ranking ?? 0 / 1) * 100).toFixed(2)}%
          </IonBadge>
        </IonItem>
        <IonItemDivider>
          <IonLabel>
            <IonIcon slot="end" icon={listOutline}></IonIcon>
          </IonLabel>
        </IonItemDivider>
        {keyRankings
          .filter((k) => k.label !== selectedKey)
          .sort((a, b) => b.ranking - a.ranking)
          .map(({ ranking, label }) => (
            <IonItem
              lines="none"
              key={label}
              button
              aria-selected={selectedKey === label}
              onClick={() => {
                setSelectedKey(label);
              }}
            >
              <IonLabel>
                <KeyViewer value={label} />
              </IonLabel>
              <IonBadge slot="end">
                {Number((ranking / 1) * 100).toFixed(2)}%
              </IonBadge>
            </IonItem>
          ))}
      </section>
    </IonList>
  );
};

export default KeyRankings;
