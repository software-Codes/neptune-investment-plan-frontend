import { DataTable } from '@/components/admin/dashboard/data-table'
import React from 'react'
import { data } from '../../data/data'

const AdminUsersPage = () => {
  return (
    <div className='w-full '>
      <DataTable data={data} />
    </div>
  )
}

export default AdminUsersPage
