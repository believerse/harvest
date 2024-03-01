import {
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  useIonModal,
} from '@ionic/react';
import {
  chevronExpandOutline,
  keyOutline,
  checkmarkCircleOutline,
  copyOutline,
} from 'ionicons/icons';
import { useClipboard } from '../../useCases/useClipboard';
import { useContext } from 'react';
import QRCode from 'react-qr-code';
import { AppContext } from '../../utils/appContext';
import { shortenB64 } from '../../utils/compat';

const KeyHolder = ({
  publicKeys,
  selectedKey,
  setSelectedKey,
}: {
  selectedKey: string;
  publicKeys: string[];
  setSelectedKey: (key: string) => void;
}) => {
  const [present, dismiss] = useIonModal(KeyDetails, {
    onDismiss: () => dismiss(),
    selectedKey,
    publicKeys,
    setSelectedKey,
  });

  return selectedKey ? (
    <IonChip
      onClick={(e) => {
        e.stopPropagation();
        present({
          initialBreakpoint: 0.75,
          breakpoints: [0, 0.75, 1],
        });
      }}
    >
      <code>{shortenB64(selectedKey)}</code>
      <IonIcon icon={chevronExpandOutline} color="primary"></IonIcon>
    </IonChip>
  ) : null;
};

export default KeyHolder;

const KeyDetails = ({
  onDismiss,
  publicKeys,
  selectedKey,
  setSelectedKey,
}: {
  onDismiss: () => void;
  selectedKey: string;
  publicKeys: string[];
  setSelectedKey: (key: string) => void;
}) => {
  const { rank } = useContext(AppContext);

  const { copyToClipboard } = useClipboard();

  const pubKeyRank = rank(selectedKey)?.rank;

  return (
    <IonContent scrollY={false}>
      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <IonChip
          className="ion-margin-bottom"
          onClick={() => copyToClipboard(selectedKey)}
        >
          <code>{shortenB64(selectedKey)}</code>
          <IonIcon icon={copyOutline} color="primary"></IonIcon>
        </IonChip>
        <QRCode
          id="QRCode"
          size={256}
          style={{
            background: 'white',
            padding: '8px',
            marginBottom: '10px',
            height: 'auto',
            width: 200,
          }}
          value={selectedKey}
          viewBox={`0 0 256 256`}
        />
      </div>
      <IonList>
        <IonListHeader>
          <IonLabel>
            <h2>
              Alternate keys{' '}
              <IonIcon icon={keyOutline} color="primary"></IonIcon>
            </h2>
            <p>You have an unlimited number of keys in your keyholder.</p>
          </IonLabel>
        </IonListHeader>
        <section className="ion-content-scroll-host">
          {publicKeys.map((pubKey) => (
            <IonItem
              key={pubKey}
              button
              detail={selectedKey !== pubKey}
              onClick={() => {
                setSelectedKey(pubKey);
              }}
              aria-selected={selectedKey === pubKey}
              disabled={selectedKey === pubKey}
            >
              <IonLabel>
                <code>{shortenB64(pubKey)}</code>
                {pubKey === selectedKey && (
                  <IonIcon
                    className="ion-margin-start"
                    icon={checkmarkCircleOutline}
                    color="success"
                  ></IonIcon>
                )}
                {pubKey === selectedKey && pubKeyRank !== undefined && (
                  <p>{(Number((pubKeyRank / 1) * 100) || 0).toFixed(2)}%</p>
                )}
              </IonLabel>
            </IonItem>
          ))}
        </section>
      </IonList>
    </IonContent>
  );
};
