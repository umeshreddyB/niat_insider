import type { Request, Response } from 'express';
import * as campusService from '../services/campus.service.js';
import { HttpStatus } from '../types/auth.types.js';

export async function listCampuses(_req: Request, res: Response): Promise<void> {
  try {
    const campuses = await campusService.listCampusNamesOrdered();
    res.status(HttpStatus.OK).json({ campuses });
  } catch (err) {
    console.error(err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Could not load campuses' });
  }
}
