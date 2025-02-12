import React from 'react'

const Cards = (props) => {
  return (
    <div className='border-white max-w-md p-4 overflow-auto'>
      <p className=' hover:bg-gray-900 text-white border rounded-md p-12 break-words font-semibold'>{props.content}</p>
    </div>
  )
}

export default Cards