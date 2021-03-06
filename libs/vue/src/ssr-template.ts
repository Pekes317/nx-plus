import { readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

import type { SSRTemplate } from './builders/ssr/schema';

export const createServerSideTemplate = (
  index: string,
  dest: string,
  templateOption: SSRTemplate
) => {
  const id = templateOption.elmentId || 'app';
  const tag = templateOption.elementTag || 'div';
  const spaContainer = new RegExp(`<${tag} id=("${id}"|${id})></${tag}>`, 'g');
  const ssrHolder = '<!--vue-ssr-outlet-->';
  const htmlIndexPath = `${dest}/${basename(index) || 'index.html'}`;
  const fileContent = readFileSync(join(process.cwd(), htmlIndexPath), {
    encoding: 'utf-8',
  });

  const ssrContent = fileContent.replace(spaContainer, ssrHolder);
  writeFileSync(
    join(process.cwd(), dest, `${templateOption.outFile || 'template.html'}`),
    ssrContent,
    {
      encoding: 'utf-8',
    }
  );
};

export const checkType = (item: string) => {
  const checkRegex = /\/\w|\W+\//;
  let result: string | RegExp = item;

  if (checkRegex.test(item)) {
    const pattern = item.slice(1, -1);

    result = new RegExp(pattern);
  }

  return result;
};
