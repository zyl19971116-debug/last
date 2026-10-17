import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:120000,use:{baseURL:'http://127.0.0.1:3002',trace:'on-first-retry'},projects:[{name:'local-anvil',use:{...devices['Desktop Chrome']}}]});
