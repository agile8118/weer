import React, { useRef } from "react";
import Navigation from "./Navigation";
import UrlShortener from "./UrlShortener";
import SignInBox from "./SignInBox";
import Urls from "./Urls";

import { AuthProvider, useAuth } from "../AuthContext";

const AppContent: React.FC = () => {
  const { isSignedIn } = useAuth();

  // Refs to child components
  const urlShortenerRef = useRef<any>(null);
  const urlsRef = useRef<any>(null);

  const renderBottomBox = () => {
    if (isSignedIn) {
      return (
        <Urls
          onRef={(ref) => (urlsRef.current = ref)}
          onDeleteUrl={(id: string) => {
            // notify the UrlShortener component that a url has been deleted
            urlShortenerRef.current?.onDeleteUrl(id);
          }}
        />
      );
    } else if (isSignedIn === false) {
      return <SignInBox />;
    } else {
      return <div />;
    }
  };

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
      {renderBottomBox()}
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
