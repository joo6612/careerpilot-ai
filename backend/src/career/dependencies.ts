import { LocalCareerRepository } from './repository';
import { CareerService } from './service';
import { createCareerRouter } from './router';

const repository = new LocalCareerRepository();
const service = new CareerService(repository);
const careerRouter = createCareerRouter(service);

export { repository as careerRepository, service as careerService, careerRouter };
export default careerRouter;
