import { LocalRoadmapRepository } from './repository';
import { careerRepository } from '../career/dependencies';
import { RoadmapService } from './service';
import { createRoadmapRouter } from './router';

const repository = new LocalRoadmapRepository();
const service = new RoadmapService(repository, careerRepository);
const roadmapRouter = createRoadmapRouter(service);

export { repository as roadmapRepository, service as roadmapService, roadmapRouter };
export default roadmapRouter;
