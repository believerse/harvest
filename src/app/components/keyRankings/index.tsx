import { IonBadge, IonIcon, IonItem, IonLabel, IonList } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { Ranking } from '../../utils/appTypes';
import KeyViewer from '../keyViewer';
import { isPublicKeyPair } from '../../utils/compat';

const KeyRankings = ({
  filterKeyPairs,
  keyRankings,
  selectedKey,
  setSelectedKey,
}: {
  filterKeyPairs: boolean;
  selectedKey: string;
  keyRankings: Ranking[];
  setSelectedKey: (key: string) => void;
}) => {
  return (
    <IonList>
      <section className="ion-content-scroll-host">
        {keyRankings
          .filter((key) =>
            filterKeyPairs ? !isPublicKeyPair(key.public_key) : true,
          )
          .sort((a, b) => b.ranking - a.ranking)
          .map(({ ranking, public_key }) => (
            <IonItem
              lines="none"
              key={public_key}
              button
              aria-selected={selectedKey === public_key}
              onClick={() => {
                setSelectedKey(public_key);
              }}
            >
              <IonLabel>
                <KeyViewer value={public_key} />
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
