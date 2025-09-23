import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { DB } from "./database/index.js";
import { IUser } from "./database/types.js";
import keys from "./config/keys.js";

interface User {
  id: string | number;
}

passport.serializeUser((user, done) => {
  const u = user as User; // cast away Express.User
  done(null, u.id);
});

passport.deserializeUser(async (id: string | number, done) => {
  const user: User = { id };
  done(null, user);
});

if (!keys.googleClientID || !keys.googleClientSecret) {
  console.log(
    "You must set Google Client ID and Client Secret in config/keys.ts file."
  );
  process.exit(1);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: `${keys.domain}/auth/google/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: User | false) => void
    ) => {
      const googleId = profile.id;
      const userName = profile._json.name as string;
      const userEmail = profile._json.email as string;

      const user = await DB.find<IUser>(
        "SELECT id FROM users WHERE google_id=$1",
        [googleId]
      );

      if (!user) return done(null, false);
      const id = user.id;

      if (id) {
        // Login user
        const user: User = { id };
        done(null, user);
      } else {
        // Create the user
        const newUser = await DB.insert<IUser>("users", {
          email: userEmail,
          name: userName,
          google_id: googleId,
        });
        if (!newUser) return done(null, false);
        const user: User = { id: newUser.id };
        done(null, user);
      }
    }
  )
);
