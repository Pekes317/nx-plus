import { JsonObject } from '@angular-devkit/core';

interface SSRBundle {
  main: string;
  outFile: string;
}

interface SSRTemplate {
  index: string;
  outFile: string;
}

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
  nodeExternalsAllowlist: string[];
  clientBundle: SSRBundle;
  serverBundle: SSRBundle;
  pluginConfig: Record<string, unknown>;
  template: SSRTemplate;
}
