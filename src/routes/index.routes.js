import { Router } from 'express';
import authRoute from './auth.routes.js';
import adminRoute from './admin.routes.js';
import userRoute from './user.routes.js';
import navigationRoute from './notification.route.js';
import chatRoute from './chat.routes.js';
import cometChatRoute from './cometChat.routes.js';
import webUserRoutes from './webUser.routes.js';

const router = Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path:'/',
    route : userRoute
  },
  {
    path: '/notification',
    route: navigationRoute
  },
  {
    path: '/chat',
    route: chatRoute
  }, 
  {
    path: '/comet-chat',
    route: cometChatRoute
  },
  {
    path: '/web-user',
    route: webUserRoutes
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});


export default router;