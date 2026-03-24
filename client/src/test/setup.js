import '@testing-library/jest-dom';

// JSDOM in the test environment doesn't implement IntersectionObserver
// Provide a lightweight mock so components using it won't throw.
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.targets = [];
  }
  observe(target) {
    this.targets.push(target);
  }
  unobserve(target) {
    this.targets = this.targets.filter(t => t !== target);
  }
  disconnect() {
    this.targets = [];
  }
}

if (typeof window !== 'undefined') {
  window.IntersectionObserver = window.IntersectionObserver || MockIntersectionObserver;

  // Tests may call window.alert / prompt; provide no-op implementations.
  window.alert = window.alert || function () {};
  window.prompt =
    window.prompt ||
    function () {
      return null;
    };

  // Provide simple clipboard and share fallbacks used by components.
  window.navigator = window.navigator || {};
  window.navigator.clipboard = window.navigator.clipboard || {
    writeText: async () => {},
  };
  window.navigator.share = window.navigator.share || undefined;
}
