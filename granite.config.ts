import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'yakunbbang',
  brand: {
    displayName: '야근빵',
    primaryColor: '#FF8C00',
    icon: './public/logo.png',
  },
  permissions: [],
  navigationBar: {
    withBackButton: true,
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'npm run dev',
      build: 'npm run build',
    },
  },
  webViewProps: {
    type: 'partner',
    bounces: false,
    pullToRefreshEnabled: false,
    overScrollMode: 'never',
  },
});
