#!/usr/bin/env node

/**
 * Test script for SFS Orchestrator
 */

console.log('🧪 Testing SFS Orchestrator System...\n');

const tests = [
  {
    name: 'Agent Registry',
    test: async () => {
      const AgentRegistry = require('../server/orchestrator/registry');
      const registry = new AgentRegistry();
      await registry.initialize();
      return registry.count() > 0;
    }
  },
  {
    name: 'State Store',
    test: async () => {
      const StateStore = require('../server/orchestrator/state-store');
      const store = new StateStore();
      await store.initialize();
      await store.set('test-key', 'test-value');
      const value = await store.get('test-key');
      return value === 'test-value';
    }
  },
  {
    name: 'Package Manager',
    test: async () => {
      const PackageManager = require('../server/orchestrator/package-manager');
      const AgentRegistry = require('../server/orchestrator/registry');
      const WorkflowEngine = require('../server/orchestrator/workflow-engine');

      const registry = new AgentRegistry();
      await registry.initialize();

      const engine = new WorkflowEngine(registry, null, null);
      const pm = new PackageManager(registry, engine);
      await pm.initialize();

      return pm.list().length > 0;
    }
  },
  {
    name: 'Connector Manager',
    test: async () => {
      const ConnectorManager = require('../server/connectors/connector-manager');
      const ClaudeConnector = require('../server/connectors/claude');

      const manager = new ConnectorManager();
      const connector = new ClaudeConnector();
      manager.register('claude', connector);

      return manager.list().includes('claude');
    }
  }
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      process.stdout.write(`Testing ${name}... `);
      const result = await test();
      if (result) {
        console.log('✅ PASS');
        passed++;
      } else {
        console.log('❌ FAIL');
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(50) + '\n');

  if (failed === 0) {
    console.log('🎉 All tests passed!\n');
    console.log('Next steps:');
    console.log('1. Start orchestrator: npm run orchestrator');
    console.log('2. Open dashboard: http://localhost:5001');
    console.log('3. List agents: npm run agent -- agent list');
    console.log('4. Execute package: npm run agent -- package execute smart-starter\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
