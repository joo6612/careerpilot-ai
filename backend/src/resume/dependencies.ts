import { LocalResumeRepository } from './repository';
import { careerRepository } from '../career/dependencies';
import { ResumeService } from './service';
import { createResumeRouter } from './router';

const repository = new LocalResumeRepository();
const service = new ResumeService(repository, careerRepository);
const resumeRouter = createResumeRouter(service);

export { repository as resumeRepository, service as resumeService, resumeRouter };
export default resumeRouter;
