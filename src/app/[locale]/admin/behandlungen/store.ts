import { INIT_SERVICES, INIT_CAMPAIGNS } from './data';
import type { Service, Campaign } from './data';

// Module-level mutable state — persists across client-side navigations within a session.
// Both the overview and detail pages read/write here so counts stay in sync.
const _services: Record<string, Service[]> = Object.fromEntries(
  Object.entries(INIT_SERVICES).map(([k, v]) => [k, v.map(s => ({ ...s }))])
);

const _campaigns: Record<string, Campaign[]> = Object.fromEntries(
  Object.entries(INIT_CAMPAIGNS).map(([k, v]) => [k, v.map(c => ({ ...c }))])
);

export const getServices  = (catId: string): Service[]  => _services[catId]  ?? [];
export const getCampaigns = (catId: string): Campaign[] => _campaigns[catId] ?? [];

export const saveServices  = (catId: string, list: Service[])  => { _services[catId]  = list; };
export const saveCampaigns = (catId: string, list: Campaign[]) => { _campaigns[catId] = list; };
