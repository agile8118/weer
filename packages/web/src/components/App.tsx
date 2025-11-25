import React from "react";
import Navigation from "./Navigation";
import UrlShortener from "./UrlShortener";
import Urls from "./Urls";

import { AuthProvider } from "../AuthContext";
import { ModalProvider } from "../ModalContext";
import { UrlProvider } from "../UrlContext";

const AppContent: React.FC = () => {
  return (
    <>
      <Navigation />
      <UrlProvider>
        <UrlShortener />
        <Urls />
      </UrlProvider>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;
