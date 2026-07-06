import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { MentorService } from './service';
import { validateChatBody, validatePersonaBody } from './validators';
import { ConversationNotFoundError, UnauthorizedConversationAccessError } from './exceptions';
import { getAllPersonas } from './personas';

export function createMentorRouter(service: MentorService): Router {
  const router = Router();

  // ============================================================
  // POST /api/mentor/chat
  // Sends a message to the AI Mentor.
  // Backward-compatible: returns { chat, reply } for legacy frontend.
  // Also returns: { reply, recommendation, conversationId, personaId }
  // Body: { text, personaId?, conversationId? }
  // ============================================================
  router.post('/chat', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const body = validateChatBody(req.body);
      const result = await service.chat(uid, body.text, body.personaId, body.conversationId);

      // Return both legacy shape and new enriched shape
      return res.json({
        // Legacy fields (frontend compatibility)
        chat: result.chat,
        reply: result.replyMessage,
        // New enriched fields
        replyText: result.reply,
        recommendation: result.recommendation,
        conversationId: result.conversationId,
        personaId: result.personaId
      });
    } catch (error: any) {
      if (error instanceof ConversationNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof UnauthorizedConversationAccessError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('POST /mentor/chat error:', error);
      return res.status(error.status || 400).json({ error: error.message || 'Failed to process mentor message' });
    }
  });

  // ============================================================
  // GET /api/mentor/chat
  // Returns the latest conversation messages as a flat array.
  // Backward-compatible: returns ChatMessage[] exactly as the legacy handler did.
  // ============================================================
  router.get('/chat', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const messages = await service.getLegacyChat(uid);
      return res.json(messages);
    } catch (error: any) {
      console.error('GET /mentor/chat error:', error);
      return res.status(500).json({ error: 'Failed to retrieve chat messages' });
    }
  });

  // ============================================================
  // GET /api/mentor/history
  // Returns all conversations for the user.
  // ============================================================
  router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const conversations = await service.getHistory(uid);
      return res.json({
        total: conversations.length,
        conversations: conversations.map(c => ({
          id: c.id,
          personaId: c.personaId,
          messageCount: c.messages.length,
          summary: c.summary,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          lastMessage: c.messages.length > 0 ? c.messages[c.messages.length - 1].text.slice(0, 100) : null
        }))
      });
    } catch (error: any) {
      console.error('GET /mentor/history error:', error);
      return res.status(500).json({ error: 'Failed to retrieve conversation history' });
    }
  });

  // ============================================================
  // GET /api/mentor/personas
  // Returns all available mentor personas and their metadata.
  // ============================================================
  router.get('/personas', async (_req: AuthenticatedRequest, res: Response) => {
    return res.json(getAllPersonas());
  });

  // ============================================================
  // POST /api/mentor/persona
  // Starts a new conversation with the selected persona.
  // Body: { personaId }
  // ============================================================
  router.post('/persona', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const body = validatePersonaBody(req.body);
      const conversation = await service.setPersona(uid, body.personaId);
      return res.status(201).json({
        success: true,
        conversation,
        message: `Started a new conversation with the ${body.personaId} persona.`
      });
    } catch (error: any) {
      console.error('POST /mentor/persona error:', error);
      return res.status(400).json({ error: error.message || 'Failed to set persona' });
    }
  });

  // ============================================================
  // GET /api/mentor/conversation/:id
  // Returns a single full conversation by ID.
  // ============================================================
  router.get('/conversation/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.params;
      const conversation = await service.getConversation(uid, id);
      return res.json(conversation);
    } catch (error: any) {
      if (error instanceof ConversationNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof UnauthorizedConversationAccessError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('GET /mentor/conversation/:id error:', error);
      return res.status(500).json({ error: 'Failed to retrieve conversation' });
    }
  });

  // ============================================================
  // DELETE /api/mentor/conversation/:id
  // Deletes a conversation by ID. Validates ownership.
  // ============================================================
  router.delete('/conversation/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.params;
      await service.deleteConversation(uid, id);
      return res.json({
        success: true,
        message: `Mentor conversation '${id}' has been deleted.`
      });
    } catch (error: any) {
      if (error instanceof ConversationNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof UnauthorizedConversationAccessError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('DELETE /mentor/conversation/:id error:', error);
      return res.status(500).json({ error: 'Failed to delete conversation' });
    }
  });

  return router;
}

export default createMentorRouter;
