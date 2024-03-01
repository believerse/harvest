import { InteractionList } from '../components/interaction';
import { PageShell } from '../components/pageShell';
import { useContext, useEffect, useState } from 'react';
import { IonSearchbar } from '@ionic/react';
import { Interaction } from '../utils/appTypes';
import { useKeyHolder } from '../useCases/useKeyHolder';
import { AppContext } from '../utils/appContext';

const Time = () => {
  const {
    tipHeader,
    requestPlotByHeight,
    currentPlot,
    genesisPlot,
    requestPkInteractions,
    pkInteractions,
    requestPendingInteractions,
    pendingInteractions,
  } = useContext(AppContext);

  const { selectedKey } = useKeyHolder();

  const tipHeight = tipHeader?.header.height ?? 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      requestPlotByHeight(tipHeight);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [tipHeight, requestPlotByHeight]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (selectedKey) {
        requestPendingInteractions(selectedKey);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedKey, requestPendingInteractions]);

  let [fieldAddress, setFieldAddress] = useState('');

  const handleSearch = (ev: Event) => {
    const target = ev.target as HTMLIonSearchbarElement;
    if (!target) return;

    const value = target.value!;

    if (!value) {
      setFieldAddress('');
      return;
    }

    if (new RegExp('[A-Za-z0-9/+]{43}=').test(value)) {
      requestPkInteractions(value);
      setFieldAddress(value);
    } else {
      //remove non Base64 characters eg: @&!; etc and pad with 00000
      const query = `${value.replace(/[^A-Za-z0-9/+]/gi, '').padEnd(43, '0')}=`;
      requestPkInteractions(query);
      setFieldAddress(value.replace(/[^A-Za-z0-9/+]/gi, ''));
    }
  };

  const [fieldQueryTxns, setFieldQueryTxns] = useState<Interaction[]>([]);

  useEffect(() => {
    const resultHandler = (data: any) => {
      if (data.detail) {
        if (new RegExp('[A-Za-z0-9/+]{43}=').test(fieldAddress)) {
          setFieldQueryTxns(pkInteractions(fieldAddress));
        } else {
          setFieldQueryTxns(pkInteractions(`${fieldAddress.padEnd(43, '0')}=`));
        }
      }
    };

    document.addEventListener('public_key_interactions', resultHandler);

    return () => {
      document.removeEventListener('public_key_interactions', resultHandler);
    };
  }, [fieldAddress, pkInteractions]);

  return (
    <PageShell
      renderBody={() => (
        <>
          <IonSearchbar
            animated={true}
            placeholder="search: /harvest"
            debounce={1000}
            onIonChange={(ev) => handleSearch(ev)}
            onIonInput={(ev) => setFieldAddress(ev.target.value! ?? '')}
            value={fieldAddress}
            type="search"
            enterkeyhint="search"
          />
          {fieldAddress ? (
            <InteractionList interactions={fieldQueryTxns} />
          ) : (
            <>
              <InteractionList
                heading="Genesis Plot"
                interactions={genesisPlot?.interactions ?? []}
              />
              {!!pendingInteractions && !!pendingInteractions.length && (
                <InteractionList
                  heading="Pending"
                  interactions={pendingInteractions}
                />
              )}
              {!!tipHeight && (
                <InteractionList
                  heading={`Current Plot: ${tipHeight + 1}`}
                  interactions={currentPlot?.interactions ?? []}
                />
              )}
            </>
          )}
        </>
      )}
    />
  );
};

export default Time;
