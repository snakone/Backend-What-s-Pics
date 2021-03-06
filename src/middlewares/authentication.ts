import { Request, Response, NextFunction } from 'express';
import Token from '../class/token';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.get('x-Token') || '';

  if (!token) {
    return res.status(406).json({
      ok: false,
      message: "No Token recieved!"
    });
  }
  const payload: any = Token.checkToken(token);

  if ( payload === undefined) {
    return res.status(401).json({
      ok: false,
      message: "Incorrect Token!"
    });
  }
  req.user = payload.user;
  next();
}