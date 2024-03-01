import { useContext, useEffect } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTextarea,
  useIonModal,
  useIonToast,
} from '@ionic/react';
import { qrCodeOutline, arrowForwardOutline } from 'ionicons/icons';
import type { OverlayEventDetail } from '@ionic/core';
import { PageShell } from '../components/pageShell';
import { Html5QrcodePlugin } from '../utils/qr-scanner';
import { useInputValidationProps } from '../useCases/useInputValidation';
import KeyViewer from '../components/keyViewer';
import KeyHolder from '../components/keyHolder';
import { useKeyHolder } from '../useCases/useKeyHolder';
import { AppContext } from '../utils/appContext';
import { shortenHex } from '../utils/compat';

const Cross = () => {
  const { pushInteraction } = useContext(AppContext);

  const {
    value: target,
    onBlur: onBlurTarget,
    isValid: isTargetValid,
    isTouched: isTargetTouched,
    onInputChange: setTarget,
  } = useInputValidationProps((target: string) =>
    new RegExp('[A-Za-z0-9/+]{43}=').test(target),
  );

  const {
    value: feedback,
    onBlur: onBlurFeedback,
    isValid: isFeedbackValid,
    isTouched: isFeedbackTouched,
    onInputChange: setFeedback,
  } = useInputValidationProps(
    (feedback: string) => feedback.length > 0 || feedback.length <= 200,
  );

  const execute = (passphrase: string, selectedKeyIndex: number) => {
    if (!isTargetValid || !isFeedbackValid) {
      return;
    }
    pushInteraction(target, feedback, passphrase, selectedKeyIndex);
  };

  const [presentScanner, dismissScanner] = useIonModal(ScanQR, {
    onDismiss: (data?: string) => dismissScanner(data),
  });

  const [presentToast] = useIonToast();

  const [presentModal, dismiss] = useIonModal(AuthorizeInteraction, {
    onDismiss: () => dismiss(),
    onAuthorize: (passphrase: string, selectedKeyIndex: number) => {
      execute(passphrase, selectedKeyIndex);
      dismiss();
    },
    target,
    instruction: feedback,
  });

  useEffect(() => {
    const pushResultHandler = (data: any) => {
      presentToast({
        message:
          data.detail.error ||
          `Interaction: ${shortenHex(data.detail.interaction_id)} was executed`,
        duration: 5000,
        position: 'bottom',
      });

      if (!data.detail.error) {
        setTarget('');
        setFeedback('');
      }
    };

    document.addEventListener('push_interaction_result', pushResultHandler);

    return () => {
      document.removeEventListener(
        'push_interaction_result',
        pushResultHandler,
      );
    };
  }, [presentToast, setTarget, setFeedback]);

  return (
    <PageShell
      renderBody={() => (
        <>
          <IonList>
            <IonItem lines="none">
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => {
                  presentScanner({
                    onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
                      if (typeof ev.detail.data === 'string') {
                        setTarget(ev.detail.data);
                      }
                    },
                  });
                }}
              >
                Scan
                <IonIcon slot="end" icon={qrCodeOutline}></IonIcon>
              </IonButton>
            </IonItem>
            <IonItem lines="none">
              <IonInput
                className={`${isTargetValid && 'ion-valid'} ${
                  isTargetValid === false && 'ion-invalid'
                } ${isTargetTouched && 'ion-touched'}`}
                label="Target"
                labelPlacement="stacked"
                clearInput={true}
                errorText="Invalid public key"
                value={
                  target.substring(40) === '000='
                    ? target.replace(/0+=?$/g, '')
                    : target
                }
                onIonBlur={() => {
                  if (!new RegExp('[A-Za-z0-9/+]{43}=').test(target)) {
                    setTarget(
                      `${target
                        .replace(/[^A-Za-z0-9/+]/gi, '')
                        .padEnd(43, '0')}=`,
                    );
                  }
                  onBlurTarget();
                }}
                onIonInput={(event) =>
                  setTarget(event.target.value?.toString() ?? '')
                }
              />
            </IonItem>

            <IonItem lines="none">
              <IonTextarea
                className={`${isFeedbackValid && 'ion-valid'} ${
                  isFeedbackValid === false && 'ion-invalid'
                } ${isFeedbackTouched && 'ion-touched'}`}
                label="Feedback"
                labelPlacement="stacked"
                counter={true}
                maxlength={200}
                value={feedback}
                onIonBlur={onBlurFeedback}
                onIonInput={(event) => setFeedback(event.target.value ?? '')}
              />
            </IonItem>
          </IonList>

          <IonButton
            disabled={!isTargetValid || !isFeedbackValid}
            expand="block"
            class="ion-padding ion-no-margin"
            strong={true}
            onClick={() =>
              presentModal({
                initialBreakpoint: 0.75,
                breakpoints: [0, 0.75],
              })
            }
          >
            Proceed
          </IonButton>
        </>
      )}
    />
  );
};

export default Cross;

export const ScanQR = ({
  onDismiss,
}: {
  onDismiss: (decodedText?: string) => void;
}) => {
  const onNewScanResult = (decodedText: string, decodedResult: any) => {
    onDismiss(decodedText ?? '');
  };
  return (
    <PageShell
      tools={[{ label: 'Cancel', action: onDismiss }]}
      renderBody={() => (
        <IonCard>
          <IonCardSubtitle>Scan QR</IonCardSubtitle>
          <IonCardContent>
            <Html5QrcodePlugin
              fps={10}
              qrbox={250}
              disableFlip={false}
              qrCodeSuccessCallback={onNewScanResult}
            />
          </IonCardContent>
        </IonCard>
      )}
    />
  );
};

const AuthorizeInteraction = ({
  onDismiss,
  onAuthorize,
  target,
  instruction,
}: {
  onDismiss: () => void;
  onAuthorize: (passphrase: string, selectedKeyIndex: number) => void;
  target: string;
  instruction: string;
}) => {
  const {
    value: passphrase,
    onBlur: onBlurPassphrase,
    isValid: isPassphraseValid,
    isTouched: isPassphraseTouched,
    onInputChange: setPassphrase,
  } = useInputValidationProps((input: string) => input.length > 0);

  const { publicKeys, selectedKey, selectedKeyIndex, setSelectedKey } =
    useKeyHolder();

  return (
    <div>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Authorize Interaction</IonCardTitle>
          <IonCardSubtitle>
            You are about to interact with this target, are you sure?
          </IonCardSubtitle>
          <IonCardSubtitle>Do you want to proceed?</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            <KeyHolder
              publicKeys={publicKeys}
              selectedKey={selectedKey}
              setSelectedKey={setSelectedKey}
            />
            <IonIcon icon={arrowForwardOutline} color="primary"></IonIcon>
            <KeyViewer value={target} />

            <IonItem lines="none">
              <IonLabel>{instruction}</IonLabel>
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonItem lines="none">
          <IonInput
            className={`${isPassphraseValid && 'ion-valid'} ${
              isPassphraseValid === false && 'ion-invalid'
            } ${isPassphraseTouched && 'ion-touched'}`}
            label="Enter Passphrase"
            labelPlacement="stacked"
            clearInput={true}
            errorText="Invalid passphrase"
            value={passphrase}
            type="password"
            onIonBlur={onBlurPassphrase}
            onIonInput={(event) =>
              setPassphrase(event.target.value?.toString() ?? '')
            }
          />
        </IonItem>
        <IonButton
          fill="solid"
          expand="block"
          strong={true}
          disabled={!isPassphraseValid}
          onClick={() => onAuthorize(passphrase, selectedKeyIndex)}
        >
          Authorize
        </IonButton>
        <IonButton
          fill="outline"
          expand="block"
          strong={true}
          onClick={() => onDismiss()}
        >
          Cancel
        </IonButton>
      </IonCard>
    </div>
  );
};
