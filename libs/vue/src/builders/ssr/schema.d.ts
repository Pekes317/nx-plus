import { JsonObject } from '@angular-devkit/core';

import { FileReplacements } from '../../utils';

interface SSRBundle {
  main: string;
  outFile: string;
}

interface SSRTemplate {
  elmentId?: string;
  elementTag?: string;
  index: string;
  outFile: string;
}

export interface SSRBuilderSchema extends JsonObject {
  assets: string[];
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
  fileReplacements?: FileReplacements[];
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
