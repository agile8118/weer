import React, { useRef } from "react";
import Navigation from "./Navigation";
import UrlShortener from "./UrlShortener";
import Urls from "./Urls";

import { AuthProvider } from "../AuthContext";

const AppContent: React.FC = () => {
  // Refs to child components
  const urlShortenerRef = useRef<any>(null);
  const urlsRef = useRef<any>(null);

  return (
    <>
      <Navigation />
      <UrlShortener
        onRef={(ref) => (urlShortenerRef.current = ref)}
        onNewUrl={() => {
          // Call a method on the child component (Urls)
          urlsRef.current?.fetchUrls();
        }}
      />
      <Urls
        onRef={(ref) => (urlsRef.current = ref)}
        onDeleteUrl={(id: string) => {
          // notify the UrlShortener component that a url has been deleted
          urlShortenerRef.current?.onDeleteUrl(id);
        }}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
