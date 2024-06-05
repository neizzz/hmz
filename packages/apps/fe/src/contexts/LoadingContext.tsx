import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

const LoadingContext = createContext({
  loading: false,
  loadingFor: async (fn: Function) => fn(),
});

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    setLoading(loadingCount !== 0);
  }, [loadingCount]);

  const loadingFor = useCallback(async (fn: Function) => {
    setLoadingCount(cnt => cnt + 1);
    try {
      await fn();
    } finally {
      setLoadingCount(cnt => cnt - 1);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, loadingFor }}>
      {children}
      {/** FIXME: 임시 로딩 */}
      {loading && (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            left: '0',
            top: '0',
            lineHeight: '100vh',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
              fontSize: '30px',
              fontWeight: 600,
            }}
          >
            Loading...
          </p>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}
