// Studio clay bodies, firing cones, and per-cone total shrinkage.
// Values sourced from each maker's published data sheet; verify against
// your own bisque + glaze fire data.

export type Cone = '04' | '5' | '6';

export type ClayBody = {
  id: string;
  group: string;
  name: string;
  shrinkage: Partial<Record<Cone, number>>;
  note?: string;
};

export const cones: Array<{ id: Cone; label: string }> = [
  { id: '04', label: 'Cone 04' },
  { id: '5',  label: 'Cone 5'  },
  { id: '6',  label: 'Cone 6'  },
];

export const defaultCone: Cone = '6';

export const clayBodies: ClayBody[] = [
  // --- Georgies (Cone 4–7 Mid-Range) ---
  { id: 'g-mix-6',                group: 'Georgies', name: 'G-Mix 6',                    shrinkage: { '04': 5.36,  '6': 10.92 } },
  { id: 'g-mix-6-grog',           group: 'Georgies', name: 'G-Mix 6 with Grog',          shrinkage: { '04': 6.37,  '6': 11.12 } },
  { id: 'kristy-lombard',         group: 'Georgies', name: 'Kristy Lombard',             shrinkage: { '04': 6.23,  '6': 11.50 } },
  { id: 'mazama-red',             group: 'Georgies', name: 'Mazama Red',                 shrinkage: { '04': 8.31,  '6': 13.50 } },
  { id: 'pat-horsley',            group: 'Georgies', name: 'Pat Horsley',                shrinkage: { '04': 6.13,  '6': 11.23 } },
  { id: 'pioneer-dark',           group: 'Georgies', name: 'Pioneer Dark',               shrinkage: { '04': 7.51,  '6': 11.23 } },
  { id: 'pioneer-dark-spkd',      group: 'Georgies', name: 'Pioneer Dark w/ Speckles',   shrinkage: { '04': 7.33,  '6': 10.99 } },
  { id: 'rogue-river-buff',       group: 'Georgies', name: 'Rogue River Buff',           shrinkage: { '04': 6.30,  '6': 11.94 } },
  { id: 'silver-falls-porcelain', group: 'Georgies', name: 'Silver Falls Porcelain',     shrinkage: { '04': 4.69,  '6': 12.03 } },
  { id: 'timberline',             group: 'Georgies', name: 'Timberline',                 shrinkage: { '04': 6.65,  '6': 11.50 } },
  { id: 'timberline-sculptural',  group: 'Georgies', name: 'Timberline Sculptural',      shrinkage: { '04': 6.01,  '6': 8.36  } },
  { id: 'trail-mix',              group: 'Georgies', name: 'Trail Mix',                  shrinkage: { '04': 6.95,  '6': 11.59 } },
  { id: 'trail-mix-cinnamon',     group: 'Georgies', name: 'Trail Mix Cinnamon',         shrinkage: { '04': 6.86,  '6': 11.86 } },
  { id: 'trail-mix-chocolate',    group: 'Georgies', name: 'Trail Mix Dark Chocolate',   shrinkage: { '04': 10.17, '6': 13.05 } },
  { id: 'trail-mix-toast',        group: 'Georgies', name: 'Trail Mix Toast',            shrinkage: { '04': 6.86,  '6': 11.07 } },
  { id: 'trillium-porcelain',     group: 'Georgies', name: 'Trillium Porcelain',         shrinkage: { '04': 6.29,  '6': 11.65 } },
  { id: 'white-salmon',           group: 'Georgies', name: 'White Salmon',               shrinkage: {              '6': 11.32 } },
  { id: 'white-salmon-grog',      group: 'Georgies', name: 'White Salmon with Grog',     shrinkage: { '04': 8.13,  '6': 9.97  } },
  { id: 'white-salmon-spkd',      group: 'Georgies', name: 'White Salmon w/ Speckles',   shrinkage: { '04': 6.95,  '6': 11.32 } },

  // --- Laguna (Cone 5–6 Mid-Fire) ---
  { id: 'laguna-50',              group: 'Laguna',   name: '50 (WC606)',                 shrinkage: { '6': 12.00 } },
  { id: 'laguna-60',              group: 'Laguna',   name: '60 (WC608)',                 shrinkage: { '6': 10.90 } },
  { id: 'laguna-75',              group: 'Laguna',   name: '75 (WC612)',                 shrinkage: { '6': 12.50 } },
  { id: 'azabache-black',         group: 'Laguna',   name: 'Azabache Black',             shrinkage: { '5': 13.00 }, note: 'Do not fire past Cone 5' },
  { id: 'bmix-5',                 group: 'Laguna',   name: 'B-Mix 5',                    shrinkage: { '5': 12.00 } },
  { id: 'bmix-5-grog',            group: 'Laguna',   name: 'B-Mix 5 with Grog',          shrinkage: { '5': 11.00 } },
  { id: 'bmix-5-speckles',        group: 'Laguna',   name: 'B-Mix 5 w/ Speckles',        shrinkage: { '5': 12.47 } },
  { id: 'calico',                 group: 'Laguna',   name: 'Calico',                     shrinkage: { '5': 13.00 } },
  { id: 'dark-horse',             group: 'Laguna',   name: 'Dark Horse',                 shrinkage: { '5': 9.00  }, note: 'Do not fire past Cone 5' },
  { id: 'frost-porcelain',        group: 'Laguna',   name: 'Frost Porcelain',            shrinkage: { '5': 11.00, '6': 11.00 } },
  { id: 'greystone-off-white',    group: 'Laguna',   name: 'Greystone Off-White',        shrinkage: { '5': 12.50, '6': 12.50 } },
  { id: 'half-half',              group: 'Laguna',   name: 'Half & Half',                shrinkage: { '5': 12.00 } },
  { id: 'red-bmix-grog',          group: 'Laguna',   name: 'Red B-Mix with Grog',        shrinkage: { '5': 9.00  } },
  { id: 'redstone',               group: 'Laguna',   name: 'Redstone',                   shrinkage: { '5': 10.50, '6': 10.50 } },
  { id: 'rsmc-special',           group: 'Laguna',   name: 'RSMC Special',               shrinkage: { '5': 12.00, '6': 12.00 } },
  { id: 'ws-5',                   group: 'Laguna',   name: 'WS-5',                       shrinkage: { '5': 10.00 } },
];

export function clayBodiesByGroup(): Record<string, ClayBody[]> {
  const groups: Record<string, ClayBody[]> = {};
  for (const body of clayBodies) {
    (groups[body.group] ??= []).push(body);
  }
  return groups;
}
