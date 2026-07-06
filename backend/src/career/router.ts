import { Router, Request, Response } from 'express';
import { CareerService } from './service';
import { CareerValidators } from './validators';
import { CareerNotFoundError } from './exceptions';

export function createCareerRouter(service: CareerService): Router {
  const router = Router();

  /**
   * GET /api/career
   * Lists all career profiles, with optional category filtering via ?category=name
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const category = CareerValidators.validateCategory(req.query.category);
      const list = await service.getAllCareers(category || undefined);
      return res.json(list);
    } catch (error: any) {
      console.error('GET /career error:', error);
      return res.status(500).json({ error: 'Failed to retrieve career profiles' });
    }
  });

  /**
   * GET /api/career/search
   * Performs fuzzy text searches across catalog profiles via ?q=query
   */
  router.get('/search', async (req: Request, res: Response) => {
    try {
      const query = CareerValidators.validateSearchQuery(req.query.q);
      const list = await service.searchCareers(query);
      return res.json(list);
    } catch (error: any) {
      console.error('GET /career/search error:', error);
      return res.status(500).json({ error: 'Failed to search career profiles' });
    }
  });

  /**
   * GET /api/career/categories
   * Returns list of distinct categories
   */
  router.get('/categories', async (_req: Request, res: Response) => {
    try {
      const categories = await service.getCategories();
      return res.json(categories);
    } catch (error: any) {
      console.error('GET /career/categories error:', error);
      return res.status(500).json({ error: 'Failed to retrieve distinct career categories' });
    }
  });

  /**
   * GET /api/career/:id
   * Resolves a single career profile
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = CareerValidators.validateId(req.params.id);
      const career = await service.getCareerById(id);
      return res.json(career);
    } catch (error: any) {
      if (error instanceof CareerNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error(`GET /career/${req.params.id} error:`, error);
      return res.status(500).json({ error: 'Failed to retrieve career profile details' });
    }
  });

  /**
   * GET /api/career/:id/skills
   * Extracts beginner, intermediate, and advanced skill metrics
   */
  router.get('/:id/skills', async (req: Request, res: Response) => {
    try {
      const id = CareerValidators.validateId(req.params.id);
      const skills = await service.getRequiredSkills(id);
      return res.json(skills);
    } catch (error: any) {
      if (error instanceof CareerNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error(`GET /career/${req.params.id}/skills error:`, error);
      return res.status(500).json({ error: 'Failed to retrieve career skills' });
    }
  });

  /**
   * GET /api/career/:id/roadmap
   * Resolves study roadmap milestones template
   */
  router.get('/:id/roadmap', async (req: Request, res: Response) => {
    try {
      const id = CareerValidators.validateId(req.params.id);
      const roadmap = await service.getRoadmapTemplate(id);
      return res.json(roadmap);
    } catch (error: any) {
      if (error instanceof CareerNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error(`GET /career/${req.params.id}/roadmap error:`, error);
      return res.status(500).json({ error: 'Failed to retrieve career roadmap milestones' });
    }
  });

  return router;
}
