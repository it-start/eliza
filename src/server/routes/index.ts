import { Router } from 'express';
import { statusRouter } from './status.routes';
import { ontologicalRouter } from './ontological.routes';
import { chatRouter } from './chat.routes';
import { workspaceRouter } from './workspace.routes';
import { channelsRouter } from './channels.routes';
import { automationRouter } from './automation.routes';
import { configRouter } from './config.routes';

export const apiRouter = Router();

// Modular Route Mounts
apiRouter.use('/status', statusRouter);
apiRouter.use('/ontological', ontologicalRouter);
apiRouter.use('/workspace', workspaceRouter);
apiRouter.use('/channels', channelsRouter);
apiRouter.use('/config', configRouter);

// Flat aliases matching existing endpoints
apiRouter.use('/', chatRouter);
apiRouter.use('/', automationRouter);
