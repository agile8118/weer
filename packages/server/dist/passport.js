import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { DB } from "./database.js";
import keys from "./config/keys.js";
passport.serializeUser((user, done) => {
    const u = user;
    done(null, u.id);
});
passport.deserializeUser(async (id, done) => {
    const user = { id };
    done(null, user);
});
if (!keys.googleClientID || !keys.googleClientSecret) {
    console.log("You must set Google Client ID and Client Secret in config/keys.ts file.");
    process.exit(1);
}
passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: `${keys.domain}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    const googleId = profile.id;
    const userName = profile._json.name;
    const userEmail = profile._json.email;
    const { id } = await DB.find(`SELECT id FROM users WHERE google_id=${googleId}`);
    if (id) {
        const user = { id };
        done(null, user);
    }
    else {
        const newId = await DB.insert("users", {
            email: userEmail,
            name: userName,
            google_id: googleId,
        });
        const user = { id: newId };
        done(null, user);
    }
}));
//# sourceMappingURL=passport.js.map