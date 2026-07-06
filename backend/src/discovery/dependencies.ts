import { LocalDiscoveryRepository } from './repository';
import { careerRepository } from '../career/dependencies';
import { DiscoveryService } from './service';
import { createDiscoveryRouter } from './router';

const repository = new LocalDiscoveryRepository();
const service = new DiscoveryService(repository, careerRepository);
const discoveryRouter = createDiscoveryRouter(service);

export { repository as discoveryRepository, service as discoveryService, discoveryRouter };
export default discoveryRouter;
