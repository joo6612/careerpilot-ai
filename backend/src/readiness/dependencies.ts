import { LocalReadinessRepository } from './repository';
import { careerRepository } from '../career/dependencies';
import { ReadinessService } from './service';
import { createReadinessRouter } from './router';

const repository = new LocalReadinessRepository();
const service = new ReadinessService(repository, careerRepository);
const readinessRouter = createReadinessRouter(service);

export { repository as readinessRepository, service as readinessService, readinessRouter };
export default readinessRouter;
