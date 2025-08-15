// ResizeObserver error suppression
// This suppresses the harmless "ResizeObserver loop completed with undelivered notifications" error
// that can occur when multiple components resize simultaneously

if (typeof window !== 'undefined') {
  // Capture the original console.error
  const originalError = console.error;
  
  // Override console.error to filter ResizeObserver warnings
  console.error = (...args) => {
    // Check if the error is the ResizeObserver loop error
    const message = args[0];
    if (
      typeof message === 'string' &&
      message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // Skip logging this specific error as it's harmless
      return;
    }
    
    // Log all other errors normally
    originalError.apply(console, args);
  };

  // Also handle the error event
  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      event.preventDefault();
      return false;
    }
  });
}

export {};
