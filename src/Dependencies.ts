import path from 'path';
import { createStandard, preloadServiceModules } from 'alpha-dic';

const container = createStandard();

preloadServiceModules(container, path.resolve(__dirname, './core/services/*.service.ts'));

export default container;
