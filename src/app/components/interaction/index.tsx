import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  useIonModal,
  IonText,
  IonNote,
  IonIcon,
  IonContent,
  IonPage,
  IonButton,
  IonToolbar,
  IonHeader,
  IonButtons,
} from '@ionic/react';
import timeago from 'epoch-timeago';
import { arrowForwardOutline } from 'ionicons/icons';
import { Interaction } from '../../utils/appTypes';
import KeyViewer from '../keyViewer';

export const InteractionItem: React.FC<Interaction> = (interaction) => {
  const [present, dismiss] = useIonModal(InteractionDetail, {
    onDismiss: () => dismiss(),
    interaction,
  });

  const { time, memo } = interaction;

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

export default InteractionItem;

interface InteractionListProps {
  heading?: string;
  interactions: Interaction[];
}

export const InteractionList = ({
  interactions,
  heading,
}: InteractionListProps) => {
  return (
    <IonList>
      {heading && (
        <IonListHeader>
          <IonLabel>{heading}</IonLabel>
        </IonListHeader>
      )}
      {!interactions.length && (
        <IonItem>
          <IonLabel>No Activity</IonLabel>
        </IonItem>
      )}
      {interactions.map((tx, index) => (
        <InteractionItem
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

export const InteractionDetail = ({
  onDismiss,
  interaction,
}: {
  onDismiss: () => void;
  interaction: Interaction;
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
            <IonCardTitle>Harvested</IonCardTitle>
            <IonLabel>
              <IonNote>
                {new Date(interaction.time * 1000).toDateString()}
              </IonNote>
            </IonLabel>
          </IonCardHeader>
          <IonCardContent>
            <KeyViewer value={interaction.from} />
            <IonIcon icon={arrowForwardOutline} color="primary"></IonIcon>
            <KeyViewer value={interaction.to} />
            <p>{interaction.memo}</p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
