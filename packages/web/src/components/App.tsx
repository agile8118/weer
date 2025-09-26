import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import UrlShortener from "./UrlShortener";
import SignInBox from "./SignInBox";
import Urls from "./Urls";

const App: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  // Refs to child components
  const urlShortenerRef = useRef<any>(null);
  const urlsRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await axios.post("/auth");
      setIsSignedIn(data.isSignedIn);
      setEmail(data.email);
    })();
  }, []);

  const renderBottomBox = () => {
    if (isSignedIn) {
      return (
        <Urls
          email={email}
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
    <div>
      <UrlShortener
        onRef={(ref) => (urlShortenerRef.current = ref)}
        onNewUrl={() => {
          // Call a method on the child component (Urls)
          urlsRef.current?.fetchUrls();
        }}
      />
      {renderBottomBox()}
    </div>
  );
};

export default App;
