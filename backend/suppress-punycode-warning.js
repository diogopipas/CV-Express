// Suppress the punycode deprecation warning
// This is a workaround until dependencies update to use newer encoding libraries

const originalEmitWarning = process.emitWarning;

process.emitWarning = function(warning, type, code) {
  if (code === 'DEP0040') {
    // Silently ignore punycode deprecation warning
    // We've installed the userland alternative as a dependency
    return;
  }
  return originalEmitWarning.apply(process, arguments);
};

