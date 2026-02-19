import { Request, Response } from 'express';
import { getPrMetrics } from '../db/index.js';

export const getMetrics = (req: Request, res: Response) => {
  try {
    const metrics = getPrMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};
