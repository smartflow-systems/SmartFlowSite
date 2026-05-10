module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/SmartFlowSite/tests', '<rootDir>/SocialScaleBooster/tests'],
  transform: {},
  testPathIgnorePatterns: ['/node_modules/'],
  modulePathIgnorePatterns: [
    '/SmartFlowSite/',
    '/SocialScaleBooster/',
    '/sfs-org/',
    '/smartflow-systems/',
    '/sfs-control/',
    '/vendor/',
    '/.pythonlibs/',
    '/.sfs-backups/'
  ],
  haste: { throwOnModuleCollision: false }
};
