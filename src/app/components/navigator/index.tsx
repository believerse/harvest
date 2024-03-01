import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTextarea,
  IonToolbar,
} from '@ionic/react';
import { useInputValidationProps } from '../../useCases/useInputValidation';

const Navigator = ({
  currentNode,
  onDismiss,
}: {
  currentNode: string;
  onDismiss: (data?: string | null | undefined, role?: string) => void;
}) => {
  const {
    value: node,
    isValid: isNodeValid,
    isTouched: isNodeTouched,
    onBlur: onBlurNode,
    onInputChange: setNode,
  } = useInputValidationProps((node: string) =>
    /(?<=^|\s)(\w*-?\w+\.[a-z]{2,}\S*)/.test(node),
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              color="medium"
              disabled={!currentNode && !node}
              onClick={() => onDismiss(null, 'cancel')}
            >
              Cancel
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              disabled={!node}
              onClick={() => onDismiss(node, 'confirm')}
              strong={true}
            >
              Confirm
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <h1>Harvest</h1>
              <h6>
                Representative identification of the unrepresented faithful
                truth.
              </h6>
              <h6>
                Searching out and highlighting noteworthy communal updates, deed
                by deed, commune by commune, day by day.
              </h6>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              The Kingdom of Heaven is like a merchant seeking beautiful pearls,
              who, when he had found one pearl of great price, went and sold all
              that he had and bought it.
            </p>
          </IonCardContent>
        </IonCard>
        <section className="ion-padding">
          <IonText color="primary">
            <p>Enter a Harvest Plot URL to continue.</p>
          </IonText>
          <IonTextarea
            className={`${isNodeValid && 'ion-valid'} ${
              isNodeValid === false && 'ion-invalid'
            } ${isNodeTouched && 'ion-touched'}`}
            label="Peer url"
            labelPlacement="stacked"
            placeholder="peer-url/plot-id"
            value={node}
            onIonBlur={onBlurNode}
            enterkeyhint="go"
            onIonInput={(event) =>
              setNode((event.target.value! ?? '').replace(/^https?:\/\//, ''))
            }
            rows={5}
          />
          <IonText color="primary">
            <p>Or select one of these:</p>
          </IonText>
          <IonChip
            onClick={() =>
              setNode(
                'sure-formerly-filly.ngrok-free.app/0000000befd8eada815673f1f4e7ee664c24533f11cf44fca0fc1cbbe42b4db8',
              )
            }
          >
            Ramat Cr
          </IonChip>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Navigator;
