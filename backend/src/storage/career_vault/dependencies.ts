import { LocalVaultRepository } from './repository';
import { VaultService } from './service';
import { createVaultRouter } from './router';

const vaultRepository = new LocalVaultRepository();
const vaultService = new VaultService(vaultRepository);
const vaultRouter = createVaultRouter(vaultService);

export { vaultRepository, vaultService, vaultRouter };
export default vaultRouter;
