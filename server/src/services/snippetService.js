import Logger from "../logger.js";
import snippetRepository from "../repositories/snippetRepository.js";
import groupRepository from "../repositories/groupRepository.js";

export class VisibilityError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const EDIT_PERMISSIONS = ["owner", "group", "readonly"];

/**
 * Who may change a snippet's content: "owner" (default) only the owner, "group" also
 * members of its group (group-only snippets), "readonly" nobody until the owner unlocks it.
 */
function resolveEditPermission(snippetData, { isPublic, groupId, existing = null }) {
  const permission = snippetData.edit_permission ?? existing?.edit_permission ?? "owner";
  if (!EDIT_PERMISSIONS.includes(permission)) {
    throw new VisibilityError(`Unknown edit permission: ${permission}`);
  }
  if (permission === "group" && (isPublic || !groupId)) {
    // Group editing needs a group; fall back for public/private snippets
    return "owner";
  }
  return permission;
}

export function canEditSnippet(snippet, userId) {
  if (!snippet || snippet.edit_permission === "readonly") return false;
  if (snippet.user_id === userId) return true;
  return (
    snippet.edit_permission === "group" &&
    !snippet.is_public &&
    !!snippet.group_id &&
    groupRepository.isMember(snippet.group_id, userId)
  );
}

/**
 * Works out is_public / group_id from the request body. Clients send either
 * `visibility` ("public" | "private" | "protected") with `group_id`, or the
 * legacy `is_public` flag. Only admins and members of a group may publish to it.
 */
function resolveVisibility(snippetData, { userId, isAdmin = false, existing = null }) {
  let visibility = snippetData.visibility;
  let groupId = snippetData.group_id ?? null;

  if (!visibility) {
    if (snippetData.is_public) {
      visibility = "public";
    } else if (snippetData.group_id !== undefined) {
      visibility = groupId ? "protected" : "private";
    } else {
      visibility = "private";
    }
  }

  if (visibility === "public") return { isPublic: 1, groupId: null };
  if (visibility === "private") return { isPublic: 0, groupId: null };
  if (visibility !== "protected") {
    throw new VisibilityError(`Unknown visibility: ${visibility}`);
  }

  groupId = parseInt(groupId);
  if (!groupId || !groupRepository.findById(groupId)) {
    throw new VisibilityError("A valid group is required for group-only snippets");
  }

  const keepsSameGroup = existing && existing.group_id === groupId;
  if (!isAdmin && !keepsSameGroup && !groupRepository.isMember(groupId, userId)) {
    throw new VisibilityError("You can only publish to groups you belong to");
  }

  return { isPublic: 0, groupId };
}

class SnippetService {
  async getAllSnippets(userId) {
    try {
      Logger.debug("Service: Getting all snippets for user:", userId);
      const result = await snippetRepository.findAll(userId);
      Logger.debug(`Service: Retrieved ${result.length} snippets`);
      return result;
    } catch (error) {
      Logger.error("Service Error - getAllSnippets:", error);
      throw error;
    }
  }

  async getAllPublicSnippets() {
    try {
      Logger.debug("Service: Getting all public snippets");
      const result = await snippetRepository.findAllPublic();
      Logger.debug(`Service: Retrieved ${result.length} public snippets`);
      return result;
    } catch (error) {
      Logger.error("Service Error - getAllPublicSnippets:", error);
      throw error;
    }
  }

  async createSnippet(snippetData, userId, { isAdmin = false } = {}) {
    try {
      Logger.debug("Service: Creating new snippet for user:", userId);
      const visibility = resolveVisibility(snippetData, { userId, isAdmin });
      const result = await snippetRepository.create({
        ...snippetData,
        userId,
        ...visibility,
        editPermission: resolveEditPermission(snippetData, visibility),
      });
      Logger.debug("Service: Created snippet with ID:", result.id);
      return result;
    } catch (error) {
      Logger.error("Service Error - createSnippet:", error);
      throw error;
    }
  }

  async moveToRecycle(id, userId) {
    try {
      Logger.debug(
        "Service: Moving snippet to recycle bin:",
        id,
        "for user:",
        userId
      );
      const result = await snippetRepository.moveToRecycle(id, userId);
      if (!result) {
        Logger.debug(
          "Service: Snippet not found or already moved to recycle bin"
        );
        return null;
      }
      Logger.debug("Service: Snippet moved to recycle bin successfully");
      return { id: result.id };
    } catch (error) {
      Logger.error("Service Error - moveToRecycle:", error);
      throw error;
    }
  }

  async getRecycledSnippets(userId) {
    try {
      // Ensure expired snippets are deleted before fetching recycled snippets
      this.deleteExpiredSnippets();

      Logger.debug("Service: Getting recycled snippets for user:", userId);
      const result = await snippetRepository.findAllDeleted(userId);
      Logger.debug(`Service: Retrieved ${result.length} recycled snippets`);
      return result;
      // return {};
    } catch (error) {
      Logger.error("Service Error - getRecycledSnippets:", error);
      throw error;
    }
  }

  async deleteExpiredSnippets() {
    try {
      Logger.debug("Service: Deleting expired snippets");
      await snippetRepository.deleteExpired();
      Logger.debug(`Service: Deleted expired snippets`);
    } catch (error) {
      Logger.error("Service Error - deleteExpiredSnippets:", error);
      throw error;
    }
  }

  async deleteSnippet(id, userId) {
    try {
      Logger.debug("Service: Deleting snippet:", id, "for user:", userId);
      const result = await snippetRepository.delete(id, userId);
      Logger.debug(
        "Service: Delete operation result:",
        result ? "Success" : "Not Found"
      );
      return result;
    } catch (error) {
      Logger.error("Service Error - deleteSnippet:", error);
      throw error;
    }
  }

  async restoreSnippet(id, userId) {
    try {
      Logger.debug("Service: Restoring snippet:", id, "for user:", userId);
      await snippetRepository.restore(id, userId);
      Logger.debug("Service: Restore operation result:", "Success");
      return { id };
    } catch (error) {
      Logger.error("Service Error - restoreSnippet:", error);
      throw error;
    }
  }

  async updateSnippet(id, snippetData, userId, { isAdmin = false } = {}) {
    try {
      Logger.debug("Service: Updating snippet:", id, "for user:", userId);
      const existing = snippetRepository.findById(id, userId);
      if (!existing) return null;

      let settings;
      if (existing.user_id === userId) {
        // The owner controls visibility and edit permission, and may unlock a read-only
        // snippet, but not change its content while it stays read-only.
        const visibility = resolveVisibility(snippetData, { userId, isAdmin, existing });
        const editPermission = resolveEditPermission(snippetData, { ...visibility, existing });
        if (existing.edit_permission === "readonly" && editPermission === "readonly") {
          throw new VisibilityError("This snippet is read-only. Change its edit permission to edit it.", 409);
        }
        settings = { ...visibility, editPermission };
      } else if (canEditSnippet(existing, userId)) {
        // Group editors change content only; sharing settings stay as the owner set them
        settings = {
          isPublic: existing.is_public,
          groupId: existing.group_id,
          editPermission: existing.edit_permission,
        };
      } else {
        // 404 rather than 403: the web client treats 403 as an expired session
        throw new VisibilityError("You do not have permission to edit this snippet", 404);
      }

      const result = await snippetRepository.update(
        id,
        { ...snippetData, ...settings },
        userId
      );
      Logger.debug(
        "Service: Update operation result:",
        result ? "Success" : "Not Found"
      );
      return result;
    } catch (error) {
      Logger.error("Service Error - updateSnippet:", error);
      throw error;
    }
  }

  async findById(id, userId = null) {
    try {
      Logger.debug(
        "Service: Getting snippet:",
        id,
        userId != null ? `for user: ${userId}` : "(public access)"
      );
      const result = await snippetRepository.findById(id, userId);
      Logger.debug(
        "Service: Find by ID result:",
        result ? "Found" : "Not Found"
      );
      if (result && userId != null) {
        result.is_owner = result.user_id === userId;
        result.can_edit = canEditSnippet(result, userId);
      }
      return result;
    } catch (error) {
      Logger.error("Service Error - findById:", error);
      throw error;
    }
  }

  async setPinned(id, value, userId) {
    try {
      Logger.debug(
        "Service: Setting pinned status for snippet:",
        id,
        "to:",
        value,
        "for user:",
        userId
      );
      const result = await snippetRepository.setPinned(id, value, userId);
      Logger.debug(
        "Service: Set pinned operation result:",
        result ? "Success" : "Not Found"
      );
      return result;
    } catch (error) {
      Logger.error("Service Error - setPinned:", error);
      throw error;
    }
  }

  async setFavorite(id, value, userId) {
    try {
      Logger.debug(
        "Service: Setting favorite status for snippet:",
        id,
        "to:",
        value,
        "for user:",
        userId
      );
      const result = await snippetRepository.setFavorite(id, value, userId);
      Logger.debug(
        "Service: Set favorite operation result:",
        result ? "Success" : "Not Found"
      );
      return result;
    } catch (error) {
      Logger.error("Service Error - setFavorite:", error);
      throw error;
    }
  }

  async getSnippetsPaginated({ userId, viewerId = null, filters, sort, limit, offset }) {
    try {
      Logger.debug(
        "Service: Getting paginated snippets for user:",
        userId,
        "with filters:",
        filters,
        "sort:",
        sort,
        "limit:",
        limit,
        "offset:",
        offset
      );
      const result = await snippetRepository.findAllPaginated({
        userId,
        viewerId,
        filters,
        sort,
        limit,
        offset
      });
      Logger.debug(
        `Service: Retrieved ${result.snippets.length} snippets, total: ${result.total}`
      );
      return result;
    } catch (error) {
      Logger.error("Service Error - getSnippetsPaginated:", error);
      throw error;
    }
  }

  async getMetadata(userId = null, viewerId = null) {
    try {
      Logger.debug(
        "Service: Getting metadata for",
        userId !== null ? `user: ${userId}` : "public snippets"
      );
      const result = await snippetRepository.getMetadata(userId, viewerId);
      Logger.debug(
        `Service: Retrieved ${result.categories.length} categories, ${result.languages.length} languages`
      );
      return result;
    } catch (error) {
      Logger.error("Service Error - getMetadata:", error);
      throw error;
    }
  }
}

export default new SnippetService();
