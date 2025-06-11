import React from 'react'

const page = () => {
  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Withdrawals</h1>
        <p className="text-gray-600 mb-6">Manage your withdrawal requests here.</p>
        {/* Add your withdrawal management components here */}
        {/* Example: WithdrawalList, WithdrawalForm, etc. */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-700 dark:text-gray-300">No withdrawals to display.</p>
        </div>
    </div>
  )
}

export default page
