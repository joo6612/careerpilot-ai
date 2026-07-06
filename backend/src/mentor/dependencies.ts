import { LocalMentorRepository } from './repository';
import { MentorService } from './service';
import { createMentorRouter } from './router';
import { careerRepository } from '../career/dependencies';
import { assessmentService } from '../assessment/dependencies';
import { roadmapService } from '../roadmap/dependencies';
import { vaultService } from '../storage/career_vault/dependencies';
import { readinessService } from '../readiness/dependencies';

const mentorRepository = new LocalMentorRepository();

const mentorService = new MentorService(
  mentorRepository,
  careerRepository,
  assessmentService,
  roadmapService,
  vaultService,
  readinessService
);

const mentorRouter = createMentorRouter(mentorService);

export { mentorRepository, mentorService, mentorRouter };
export default mentorRouter;
