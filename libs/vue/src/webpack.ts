import { BuilderContext } from '@angular-devkit/architect';
import { getSystemPath, join, normalize, Path } from '@angular-devkit/core';
import CopyPlugin from 'copy-webpack-plugin';
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin';
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin';
import WebpackBar from 'webpackbar';
import nodeExternals from 'webpack-node-externals';

import { BrowserBuilderSchema } from './builders/browser/schema';
import { LibraryBuilderSchema } from './builders/library/schema';
import { SSRBuilderSchema } from './builders/ssr/schema';
import { RenderTarget } from './utils';

export function addServerSideRender(
  config,
  options: SSRBuilderSchema,
  context: BuilderContext,
  target: RenderTarget
) {
  const isClient = target === RenderTarget.client;

  if (isClient) {
    config.plugin('ssr').use(VueSSRClientPlugin, [
      {
        filename: options.clientBundle.outFile || 'client.json',
      },
    ]);
    config
      .plugin('loader')
      .use(WebpackBar, [{ name: 'Client', color: 'green' }]);
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        options.optimizeSSR = false;

        return options;
      });
    config.entry('app').clear();

    if (options && options.clientBundle) {
      config
        .entry('app')
        .add(
          getSystemPath(
            join(normalize(context.workspaceRoot), options?.clientBundle?.main)
          )
        );
    }
  } else {
    config.plugin('ssr').use(VueSSRServerPlugin, [
      {
        filename: options.serverBundle.outFile || 'server.json',
      },
    ]);
    config
      .plugin('loader')
      .use(WebpackBar, [{ name: 'Server', color: 'orange' }]);

    config.output.libraryTarget('commonjs2');
    config.target('node');
    config.optimization.splitChunks(false).minimize(false);
    config.externals(
      nodeExternals({ allowlist: options.nodeExternalsAllowlist || [] })
    );
    config.node.clear();

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        if (!isClient) {
          options.cacheIdentifier += '-server';
          options.cacheDirectory += '-server';
        }

        options.optimizeSSR = !isClient;

        return options;
      });
    config.entry('app').clear();

    if (options && options.serverBundle) {
      config
        .entry('app')
        .add(
          getSystemPath(
            join(normalize(context.workspaceRoot), options?.serverBundle?.main)
          )
        );
    }

    if (options && options.template) {
      config.plugin('html').tap((args) => {
        args[0].filename = options.template.outFile;
        args[0].template = getSystemPath(
          join(normalize(context.workspaceRoot), options.template.index)
        );

        return args;
      });
    }
  }
}

export function copyStaticAssets(
  config,
  options: BrowserBuilderSchema | SSRBuilderSchema,
  context: BuilderContext
) {
  const publicCheck = /(public)/gi;

  if (options.assets && options.assets.length > 0) {
    const transformedAssetPatterns = options.assets.map((asset) => {
      const assetPath = publicCheck.test(asset)
        ? asset.split('public')[1]
        : asset.split('src')[1];

      return {
        from: getSystemPath(join(normalize(context.workspaceRoot), asset)),
        to: getSystemPath(
          join(normalize(context.workspaceRoot), options.dest, assetPath)
        ),
      };
    });

    config.plugin('copy').use(CopyPlugin, [transformedAssetPatterns]);
  }
}

export function modifyIndexHtmlPath(
  config,
  options: BrowserBuilderSchema | SSRBuilderSchema,
  context: BuilderContext
): void {
  config.plugin('html').tap((args) => {
    args[0].template = getSystemPath(
      join(normalize(context.workspaceRoot), options.index)
    );
    return args;
  });
}

export function modifyEntryPoint(
  config,
  options: BrowserBuilderSchema | SSRBuilderSchema,
  context: BuilderContext
): void {
  config.entry('app').clear();
  config
    .entry('app')
    .add(getSystemPath(join(normalize(context.workspaceRoot), options.main)));
}

export function modifyTsConfigPaths(
  config,
  options: BrowserBuilderSchema | LibraryBuilderSchema | SSRBuilderSchema,
  context: BuilderContext
): void {
  const tsConfigPath = getSystemPath(
    join(normalize(context.workspaceRoot), options.tsConfig)
  );

  config.module
    .rule('ts')
    .use('ts-loader')
    .tap((loaderOptions) => {
      loaderOptions.configFile = tsConfigPath;
      return loaderOptions;
    });
  config.module
    .rule('tsx')
    .use('ts-loader')
    .tap((loaderOptions) => {
      loaderOptions.configFile = tsConfigPath;
      return loaderOptions;
    });
  config.plugin('fork-ts-checker').tap((args) => {
    args[0].tsconfig = tsConfigPath;
    return args;
  });
}

export function modifyCachePaths(config, context: BuilderContext): void {
  const vueLoaderCachePath = getSystemPath(
    join(normalize(context.workspaceRoot), 'node_modules/.cache/vue-loader')
  );
  const tsLoaderCachePath = getSystemPath(
    join(normalize(context.workspaceRoot), 'node_modules/.cache/ts-loader')
  );

  config.module
    .rule('vue')
    .use('cache-loader')
    .tap((options) => {
      options.cacheDirectory = vueLoaderCachePath;
      return options;
    });
  config.module
    .rule('vue')
    .use('vue-loader')
    .tap((options) => {
      options.cacheDirectory = vueLoaderCachePath;
      return options;
    });
  config.module
    .rule('ts')
    .use('cache-loader')
    .tap((options) => {
      options.cacheDirectory = tsLoaderCachePath;
      return options;
    });
  config.module
    .rule('tsx')
    .use('cache-loader')
    .tap((options) => {
      options.cacheDirectory = tsLoaderCachePath;
      return options;
    });
}

export function modifyTypescriptAliases(
  config,
  options: BrowserBuilderSchema | LibraryBuilderSchema | SSRBuilderSchema,
  context: BuilderContext
) {
  const tsConfigPath = getSystemPath(
    join(normalize(context.workspaceRoot), options.tsConfig)
  );
  const extensions = [
    '.tsx',
    '.ts',
    '.mjs',
    '.js',
    '.jsx',
    '.vue',
    '.json',
    '.wasm',
  ];
  config.resolve.alias.delete('@');
  config.resolve
    .plugin('tsconfig-paths')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .use(require('tsconfig-paths-webpack-plugin'), [
      {
        configFile: tsConfigPath,
        extensions,
      },
    ]);
}

export function modifyCopyAssets(
  config,
  options: LibraryBuilderSchema,
  context: BuilderContext,
  projectRoot: Path
): void {
  const transformedAssetPatterns = ['package.json', 'README.md'].map(
    (file) => ({
      from: getSystemPath(join(projectRoot, file)),
      to: getSystemPath(join(normalize(context.workspaceRoot), options.dest)),
    })
  );

  config
    .plugin('copy')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .use(require('copy-webpack-plugin'), [transformedAssetPatterns]);
}
