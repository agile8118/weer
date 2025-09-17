import type { CpeakRequest as Request, CpeakResponse as Response } from "cpeak";
declare const _default: {
    logOut: (req: Request, res: Response) => void;
    isLoggedIn: (req: Request, res: Response) => Promise<void>;
};
export default _default;
