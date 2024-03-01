import { IonInput, IonButton, IonItem, IonList, IonText } from '@ionic/react';
import { usePasswordValidationProps } from '../../useCases/usePwdStrength';

const EnterPassPhrase = ({
  applyPassPhrase,
}: {
  applyPassPhrase: (phrase: string) => void;
}) => {
  const {
    value: passPhrase,
    onBlur: onBlurPassPhrase,
    isValid: isPassPhraseValid,
    isTouched: isPassPhraseTouched,
    onInputChange: setPassPhrase,
    result: pwdStrength,
  } = usePasswordValidationProps(
    (passPhrase: string, strength) => (strength?.score ?? 0) > 2,
  );

  return (
    <>
      <IonList>
        <IonItem>
          <IonInput
            className={`${isPassPhraseValid && 'ion-valid'} ${
              isPassPhraseValid === false && 'ion-invalid'
            } ${isPassPhraseTouched && 'ion-touched'}`}
            label="Passphrase"
            labelPlacement="stacked"
            type="password"
            value={passPhrase}
            onIonBlur={onBlurPassPhrase}
            errorText={pwdStrength?.feedback.warning ?? ''}
            onIonInput={(event) =>
              setPassPhrase(event.target.value?.toString() ?? '')
            }
          />
        </IonItem>
      </IonList>

      <IonButton
        disabled={!isPassPhraseValid}
        expand="block"
        onClick={() => applyPassPhrase(passPhrase)}
        class="ion-padding ion-no-margin"
      >
        Apply passphrase
      </IonButton>
    </>
  );
};

export const ImportKeyHolder = ({
  importKeyholder,
}: {
  importKeyholder: (passPhrase: string) => void;
}) => {
  return (
    <>
      <IonText class="ion-text-center" color="danger">
        <p>
          Your passphrase is your unique and private access to your keyholder.
        </p>
        <p>Use a secure passphrase that is not easy to guess.</p>
        <p>Your keyholder will be lost permanently if you forget it.</p>
      </IonText>

      <EnterPassPhrase
        applyPassPhrase={(passPhrase) => importKeyholder(passPhrase)}
      />
    </>
  );
};
