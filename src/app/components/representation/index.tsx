import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonCard,
  IonCardContent,
  IonCardHeader,
  useIonModal,
  IonText,
  IonNote,
  IonContent,
  IonPage,
  IonButton,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonCardSubtitle,
} from '@ionic/react';
import timeago from 'epoch-timeago';
import { Representation } from '../../utils/appTypes';
import KeyViewer from '../keyViewer';

export const RepresentationItem: React.FC<Representation> = (
  representation,
) => {
  const [present, dismiss] = useIonModal(RepresentationDetail, {
    onDismiss: () => dismiss(),
    representation,
  });

  const { time, memo } = representation;

  const timeMS = time * 1000;

  return (
    <IonItem lines="none" onClick={() => present()}>
      <IonLabel className="ion-text-wrap">
        <IonText color="tertiary">
          <sub>
            <time dateTime={new Date(timeMS).toISOString()}>
              <p>{timeago(timeMS)}</p>
            </time>
          </sub>
        </IonText>
        {memo && <p>{memo}</p>}
      </IonLabel>
    </IonItem>
  );
};

export default RepresentationItem;

interface RepresentationListProps {
  heading?: string;
  representations: Representation[];
}

export const RepresentationList = ({
  representations,
  heading,
}: RepresentationListProps) => {
  return (
    <IonList>
      {heading && (
        <IonListHeader>
          <IonLabel>{heading}</IonLabel>
        </IonListHeader>
      )}
      {!representations.length && (
        <IonItem>
          <IonLabel>No Activity</IonLabel>
        </IonItem>
      )}
      {representations.map((tx, index) => (
        <RepresentationItem
          key={index}
          from={tx.from}
          to={tx.to}
          memo={tx.memo}
          time={tx.time}
        />
      ))}
    </IonList>
  );
};

export const RepresentationDetail = ({
  onDismiss,
  representation,
}: {
  onDismiss: () => void;
  representation: Representation;
}) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => onDismiss()}>
              Close
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>
              Represented by: <KeyViewer value={representation.from} />
            </IonCardSubtitle>
            <IonLabel>
              <IonNote>
                {new Date(representation.time * 1000).toDateString()}
              </IonNote>
            </IonLabel>
          </IonCardHeader>
          <IonCardContent>
            <KeyViewer value={representation.to} />
            <p>{representation.memo}</p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
