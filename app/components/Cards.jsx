import React from 'react'

const Cards = (props) => {
  return (
    <div className='border-black max-w-md p-4 overflow-auto'>
      <p className=' hover:bg-gray-200 text-black border borde rounded-md p-12 break-words font-semibold'>{props.content}</p>
    </div>
  )
}

export default Cards