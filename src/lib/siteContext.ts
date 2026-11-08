import { createContext, useContext } from 'react';
import { Site } from './site';

export const SiteContext = createContext<Site | null>(null);

export function useSite(): Site {
  const site = useContext(SiteContext);
  if (!site) throw new Error('useSite() harus dipakai di dalam SiteContext.Provider');
  return site;
}
