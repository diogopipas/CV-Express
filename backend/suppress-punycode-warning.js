// Suppress punycode deprecation warning
// This is a temporary fix for the Node.js punycode deprecation warning
// The warning appears because some dependencies still use the deprecated punycode module

const originalEmitWarning = process.emitWarning;

process.emitWarning = function (warning, ...args) {
  // Suppress the punycode deprecation warning
  if (
    args[0] === 'DeprecationWarning' &&
    (warning.includes('punycode') || (typeof warning === 'string' && warning.includes('punycode')))
  ) {
    return;
  }
  
  // Call the original emitWarning for all other warnings
  return originalEmitWarning.call(process, warning, ...args);
};

