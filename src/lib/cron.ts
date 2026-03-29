import cron from 'node-cron'

// Schedule cron job to update top channels every 6 hours
export function scheduleCronJobs() {
  // Run every 6 hours: at 00:00, 06:00, 12:00, and 18:00
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running scheduled top channels update...')

    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cron/update-top-channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Top channels updated successfully:', data)
      } else {
        console.error('Failed to update top channels:', data)
      }
    } catch (error) {
      console.error('Error running cron job:', error)
    }
  })

  console.log('Cron jobs scheduled successfully')

  // Run immediately on startup (optional)
  if (process.env.RUN_CRON_ON_STARTUP === 'true') {
    console.log('Running initial top channels update...')
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cron/update-top-channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    })
      .then(res => res.json())
      .then(data => console.log('Initial update complete:', data))
      .catch(err => console.error('Initial update failed:', err))
  }
}
