import { JsonObject } from '@angular-devkit/core';

import { FileReplacements } from '../../utils';

export interface BrowserBuilderSchema extends JsonObject {
  assets?: string[];
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
  fileReplacements?: FileReplacements[];
  pluginConfig?: Record<string, unknown>;
  stdin: boolean;
}
