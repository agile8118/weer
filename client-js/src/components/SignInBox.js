import React from "react";

const SingInBox = () => {
  return (
    <section className="section section--2">
      <h2>Sign in to get permanent shortened links</h2>
      <p>
        If you create shortened links as a guest, your links will be removed
        from our database <strong>if they get no views after 1 month</strong>,
        but if you sign in, your links will be permanent and they will never get
        removed unless you choose so.
      </p>
      <p>
        You can sign in right now with a couple of simple clicks and it is{" "}
        <strong> completely free.</strong> We won't send you any emails,
        newsletters whatsoever, your account will only be used to keep track of
        your links.
      </p>
      <p>
        Another advantage of signing in is that you can see the list of all the
        links you've shortened with your account.
      </p>
      <a className="button button-google-signin" href="/auth/google">
        <img src="/google-icon.svg" alt="Google icon" /> Sign in with google
      </a>
    </section>
  );
};

export default SingInBox;
