export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('uncaughtException', (err) => {
      console.error('[instrumentation] uncaughtException:', err.message, err.stack)
    })
    process.on('unhandledRejection', (reason) => {
      console.error('[instrumentation] unhandledRejection:', reason)
    })
  }
}
