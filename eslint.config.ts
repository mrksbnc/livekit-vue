import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import oxlint from 'eslint-plugin-oxlint';
import pluginVue from 'eslint-plugin-vue';

export default defineConfigWithVueTs(
  {
    files: ['**/*.{ts,vue}'],
  },
  {
    ignores: ['**/dist/**', '**/coverage/**'],
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  ...oxlint.configs['flat/recommended'],
  skipFormatting,
);
