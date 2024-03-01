import { IonChip, IonIcon, IonText, useIonModal } from '@ionic/react';
import { qrCodeOutline, copyOutline } from 'ionicons/icons';
import QRCode from 'react-qr-code';
import { useClipboard } from '../../useCases/useClipboard';
import { useContext, useEffect } from 'react';
import { InteractionList } from '../interaction';
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
      <IonIcon icon={qrCodeOutline} color="primary"></IonIcon>
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

  const { pkInteractions, requestPkInteractions, rank, requestRank } =
    useContext(AppContext);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (value) {
        requestRank(value);
        requestPkInteractions(value);
      }
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, requestRank, requestPkInteractions]);

  const interactions = pkInteractions(value);

  const pubKeyRank = rank(value)?.rank;

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
        <QRCode
          id="QRCode"
          size={256}
          style={{
            background: 'white',
            padding: '8px',
            height: 'auto',
            width: 200,
          }}
          value={value}
          viewBox={`0 0 256 256`}
        />
        {pubKeyRank !== undefined && (
          <IonText color="primary">
            <p>
              <strong>Interactivity: </strong>
              <i>{Number((pubKeyRank / 1) * 100).toFixed(2)}%</i>
            </p>
          </IonText>
        )}
        {!!interactions && !!interactions.length && (
          <div
            style={{
              alignSelf: 'stretch',
            }}
          >
            <InteractionList interactions={interactions} />
          </div>
        )}
      </div>
    </>
  );
};
