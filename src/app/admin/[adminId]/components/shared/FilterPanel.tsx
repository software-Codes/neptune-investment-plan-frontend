import React from 'react'

const FilterPanel = () => {
  return (
    <div>
      <h2>Filter Transactions</h2>
      <input type="text" placeholder="Search by ID" />
      <select>
        <option value="">Select Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  )
}

export default FilterPanel
