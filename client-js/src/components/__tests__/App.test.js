import "../../setupTests";

import App from "../App";
import UrlShortener from "../UrlShortener";
import SignInBox from "../SignInBox";
import Urls from "../Urls";

afterEach(() => {
  moxios.uninstall();
});

describe("when user is signed out", () => {
  beforeEach(() => {
    moxios.install();
    moxios.stubRequest("/auth", {
      status: 200,
      response: {
        isSignedIn: false
      }
    });
  });

  it("shows the sing in and url shortener boxes", done => {
    const wrapped = shallow(<App />);
    moxios.wait(() => {
      wrapped.update();
      expect(wrapped.find(UrlShortener).length).toEqual(1);
      expect(wrapped.find(SignInBox).length).toEqual(1);
      wrapped.unmount();
      done();
    });
  });
});

describe("when user is signed in", () => {
  beforeEach(() => {
    moxios.install();
    moxios.stubRequest("/auth", {
      status: 200,
      response: {
        isSignedIn: true,
        email: "email@company.com"
      }
    });
  });

  it("shows a list of urls and url shortener box", done => {
    const wrapped = shallow(<App />);
    moxios.wait(() => {
      wrapped.update();
      expect(wrapped.find(UrlShortener).length).toEqual(1);
      expect(wrapped.find(Urls).length).toEqual(1);
      wrapped.unmount();
      done();
    });
  });
});
