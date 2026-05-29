// Sample data used across all test suites

export const TEST_USER = {
  email: process.env.TEST_EMAIL ?? 'test+org@shipflow.dev',
  password: process.env.TEST_PASSWORD ?? 'Test@1234',
  firstName: 'Test',
  lastName: 'Exporter',
};

export const SAMPLE_ORG = {
  name: 'Acme Exports Pvt Ltd',
  tradeName: 'Acme',
  country: 'India',
};

export const SAMPLE_ORG_UPDATE = {
  iecCode: 'AACE012345', // 10-char IEC code
  gstNumber: '27AABCU9603R1ZM', // valid GSTIN format
  panNumber: 'AABCU9603R',
  cinNumber: 'U74999MH2020PTC123456',
  adCode: 'AD1234567',
  addressLine1: '12 Export House, BKC',
  addressLine2: 'Bandra Kurla Complex',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400051',
  country: 'India',
  phone: '9876543210',
  email: 'exports@acme.example.com',
  website: 'https://acme.example.com',
};

export const SAMPLE_BANK = {
  bankName: 'HDFC Bank',
  bankAccountNo: '50200012345678',
  bankIFSC: 'HDFC0001234',
  bankBranch: 'BKC Mumbai',
  swiftCode: 'HDFCINBBXXX',
};

export const SAMPLE_SHIPPING = {
  countryOfOrigin: 'India',
  portOfLoading: 'INMUN - Mundra',
  placeOfReceipt: 'Ahmedabad ICD',
  masterCurrency: 'USD' as const,
};

export const SAMPLE_ITEM_CODE = {
  itemCodePrefix: 'ACM',
  itemCodeDigits: 5,
};

export const SECOND_ORG = {
  name: 'Beta Traders Ltd',
  country: 'India',
};
