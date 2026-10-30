import express from 'express';
import groupRepository from '../repositories/groupRepository.js';
import { isAdmin } from '../middleware/adminAuth.js';
import Logger from '../logger.js';

const router = express.Router();

// Groups the current user can publish group-only snippets to: every group for admins,
// otherwise the groups they belong to.
router.get('/', async (req, res) => {
  try {
    const groups = isAdmin(req.user.username)
      ? groupRepository.findAll().map(({ id, name, description }) => ({ id, name, description }))
      : groupRepository.findForUser(req.user.id);
    res.json(groups);
  } catch (error) {
    Logger.error('Error getting groups:', error);
    res.status(500).json({ error: 'Failed to retrieve groups' });
  }
});

export default router;
