import { RepresentationList } from '../components/representation';
import { PageShell } from '../components/pageShell';
import { useContext, useEffect, useState } from 'react';
import { IonSearchbar } from '@ionic/react';
import { Representation } from '../utils/appTypes';
import { useKeyHolder } from '../useCases/useKeyHolder';
import { AppContext } from '../utils/appContext';

const Time = () => {
  const {
    tipHeader,
    requestPlotByHeight,
    currentPlot,
    genesisPlot,
    requestPkRepresentations,
    pkRepresentations,
    requestPendingRepresentations,
    pendingRepresentations,
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
        requestPendingRepresentations(selectedKey);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedKey, requestPendingRepresentations]);

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
      requestPkRepresentations(value);
      setFieldAddress(value);
    } else {
      //remove non Base64 characters eg: @&!; etc and pad with 00000
      const query = `${value.replace(/[^A-Za-z0-9/+]/gi, '').padEnd(43, '0')}=`;
      requestPkRepresentations(query);
      setFieldAddress(value.replace(/[^A-Za-z0-9/+]/gi, ''));
    }
  };

  const [fieldQueryTxns, setFieldQueryTxns] = useState<Representation[]>([]);

  useEffect(() => {
    const resultHandler = (data: any) => {
      if (data.detail) {
        if (new RegExp('[A-Za-z0-9/+]{43}=').test(fieldAddress)) {
          setFieldQueryTxns(pkRepresentations(fieldAddress));
        } else {
          setFieldQueryTxns(
            pkRepresentations(`${fieldAddress.padEnd(43, '0')}=`),
          );
        }
      }
    };

    document.addEventListener('public_key_representations', resultHandler);

    return () => {
      document.removeEventListener('public_key_representations', resultHandler);
    };
  }, [fieldAddress, pkRepresentations]);

  return (
    <PageShell
      renderBody={() => (
        <>
          <IonSearchbar
            animated={true}
            placeholder="/notes /roadmap /help"
            debounce={1000}
            onIonChange={(ev) => handleSearch(ev)}
            onIonInput={(ev) => setFieldAddress(ev.target.value! ?? '')}
            value={fieldAddress}
            type="search"
            enterkeyhint="search"
          />
          {fieldAddress ? (
            <RepresentationList representations={fieldQueryTxns} />
          ) : (
            <>
              <RepresentationList
                heading="Genesis Plot"
                representations={genesisPlot?.representations ?? []}
              />
              {!!pendingRepresentations && !!pendingRepresentations.length && (
                <RepresentationList
                  heading="Pending"
                  representations={pendingRepresentations}
                />
              )}
              {!!tipHeight && (
                <RepresentationList
                  heading={`Current Plot: #${tipHeight + 1}`}
                  representations={currentPlot?.representations ?? []}
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
