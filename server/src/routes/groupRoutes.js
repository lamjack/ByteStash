import express from 'express';
import groupRepository from '../repositories/groupRepository.js';
import { isAdmin } from '../middleware/adminAuth.js';
import Logger from '../logger.js';
import snippetService from '../services/snippetService.js';

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

// People to share a snippet with, matched by username: GET /api/groups/share-users?q=ali
router.get('/share-users', async (req, res) => {
  try {
    res.json(groupRepository.searchUsers(req.query.q, req.user.id));
  } catch (error) {
    Logger.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Snippets shared with the user (directly or via a group) plus their own shared snippets.
// Same query params as GET /api/snippets, plus `group` to narrow to one group.
router.get('/snippets', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 50;
    if (limit < 1 || limit > 100) limit = 50;
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    const { snippets, total } = await snippetService.getSnippetsPaginated({
      userId: null,
      sharedViewerId: req.user.id,
      filters: {
        search: req.query.search || null,
        searchCode: req.query.searchCode === 'true',
        language: req.query.language || null,
        categories: req.query.category
          ? req.query.category.split(',').map((c) => c.trim().toLowerCase())
          : null,
        groupId: parseInt(req.query.group) || null,
      },
      sort: req.query.sort || 'newest',
      limit,
      offset,
    });

    res.json({
      data: snippets,
      pagination: { total, offset, limit, hasMore: offset + limit < total },
    });
  } catch (error) {
    Logger.error('Error fetching group snippets:', error);
    res.status(500).json({ error: 'Failed to fetch group snippets' });
  }
});

router.get('/snippets/metadata', async (req, res) => {
  try {
    res.json(await snippetService.getMetadata(null, null, req.user.id));
  } catch (error) {
    Logger.error('Error fetching group snippet metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

export default router;
