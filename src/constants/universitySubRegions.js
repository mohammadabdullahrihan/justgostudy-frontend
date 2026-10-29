// Intra-country university groupings shown on the Country Detail page's
// Universities tab and set via the admin University form. Matches the
// authoritative taxonomy in justtrip-edu-backend/seeds/regionwithuniversity.md
// — keep both in sync if the taxonomy ever changes.
const UNIVERSITY_SUB_REGIONS = {
  USA: ['Northeast', 'Midwest', 'South', 'West'],
  UK: [
    'Greater London & South East',
    'South West & East of England',
    'Midlands & North of England',
    'Scotland',
    'Wales & Northern Ireland',
  ],
  Canada: ['Ontario & Quebec', 'Western Canada', 'Atlantic Canada'],
  Australia: [
    'New South Wales (NSW)',
    'Victoria (VIC)',
    'Queensland (QLD)',
    'Western Australia (WA)',
    'South Australia / Tasmania / Northern Territory',
  ],
  'New Zealand': [
    'Auckland Region',
    'Waikato & Bay of Plenty',
    'Wellington Region',
    'Canterbury Region',
    'Otago Region',
  ],
};

export default UNIVERSITY_SUB_REGIONS;
