import { JsonObject } from '@angular-devkit/core';

export interface SSRBuilderSchema extends JsonObject {
  mode: string;
  dest: string;
  clean: boolean;
  report: boolean;
  reportJson: boolean;
  skipPlugins?: string;
  watch: boolean;
  index: string;
  main: string;
  tsConfig: string;
  publicPath: string;
  filenameHashing: boolean;
  productionSourceMap: boolean;
  css: {
    requireModuleExtension: boolean;
    extract: boolean | object;
    sourceMap: boolean;
    loaderOptions: object;
  };
  pluginConfig: Record<string, unknown>;
}