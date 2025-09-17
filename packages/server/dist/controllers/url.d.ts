import type { CpeakRequest as Request, CpeakResponse as Response, HandleErr } from "cpeak";
declare const _default: {
    getUrls: (req: Request, res: Response) => Promise<void>;
    shorten: (req: Request, res: Response) => Promise<void>;
    redirect: (req: Request, res: Response, handleErr: HandleErr) => Promise<void>;
    remove: (req: Request, res: Response) => Promise<void>;
};
export default _default;
