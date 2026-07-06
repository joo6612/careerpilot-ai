import { LocalAssessmentRepository } from './repository';
import { AssessmentService } from './service';
import { createAssessmentRouter } from './router';

const repository = new LocalAssessmentRepository();
const service = new AssessmentService(repository);
const assessmentRouter = createAssessmentRouter(service);

export { repository as assessmentRepository, service as assessmentService, assessmentRouter };
export default assessmentRouter;
