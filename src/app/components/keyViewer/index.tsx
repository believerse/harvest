import { IonChip, IonIcon, IonText, useIonModal } from '@ionic/react';
import { receiptOutline, copyOutline } from 'ionicons/icons';
import { useClipboard } from '../../useCases/useClipboard';
import { useContext, useEffect } from 'react';
import { RepresentationList } from '../representation';
import { AppContext } from '../../utils/appContext';
import { shortenB64 } from '../../utils/compat';

const KeyAbbrev = ({ value }: { value: string }) => {
  const abbrevKey = shortenB64(value);

  return <code>{abbrevKey}</code>;
};

interface KeyViewerProps {
  value: string;
}

const KeyViewer: React.FC<KeyViewerProps> = ({ value }) => {
  const [present, dismiss] = useIonModal(KeyDetails, {
    onDismiss: () => dismiss(),
    value,
  });

  return value ? (
    <IonChip
      onClick={(e) => {
        e.stopPropagation();
        present({
          initialBreakpoint: 0.75,
          breakpoints: [0, 0.75, 1],
        });
      }}
    >
      <IonIcon icon={receiptOutline} color="primary"></IonIcon>
      <KeyAbbrev value={value} />
    </IonChip>
  ) : null;
};

export default KeyViewer;

export const KeyDetails = ({
  onDismiss,
  value,
}: {
  onDismiss: () => void;
  value: string;
}) => {
  const { copyToClipboard } = useClipboard();

  const {
    colorScheme,
    pkRepresentations,
    requestPkRepresentations,
    ranking,
    requestRanking,
    imbalance,
    requestImbalance,
  } = useContext(AppContext);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (value) {
        requestRanking(value);
        requestImbalance(value);
        requestPkRepresentations(value);
      }
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, requestRanking, requestImbalance, requestPkRepresentations]);

  const representations = pkRepresentations(value);

  const pubKeyRanking = ranking(value)?.ranking;
  const pubKeyImbalance = imbalance(value)?.imbalance;

  return (
    <>
      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <IonChip
          className="ion-margin-bottom"
          onClick={() => copyToClipboard(value)}
        >
          <KeyAbbrev value={value} />
          <IonIcon icon={copyOutline} color="primary"></IonIcon>
        </IonChip>
        {pubKeyRanking !== undefined && (
          <IonText color="primary">
            <p>
              {pubKeyRanking !== undefined && (
                <>
                  <strong>Representivity: </strong>
                  <i>{Number((pubKeyRanking / 1) * 100).toFixed(2)}%</i>
                </>
              )}
              <br />
              {pubKeyImbalance !== undefined && (
                <>
                  <strong>Imbalance: </strong>
                  <i>
                    {`${pubKeyImbalance} reps`}
                    {colorScheme === 'light' ? <>&#127793;</> : <>&#128165;</>}
                  </i>
                </>
              )}
            </p>
          </IonText>
        )}
        {!!representations && !!representations.length && (
          <div
            style={{
              alignSelf: 'stretch',
            }}
          >
            <RepresentationList representations={representations} />
          </div>
        )}
      </div>
    </>
  );
};
