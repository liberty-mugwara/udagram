import { Request, Response } from 'express';

export type TControllerFn = (
  req: Request,
  res: Response,
) => unknown | Promise<unknown>;
