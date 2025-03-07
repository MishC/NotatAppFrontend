export const Card = ({ title, content}) => {
  return ( 
    
       

    <>
       <div className="w-full">
         <h3 className="text-xl font-bold text-black">{title}</h3>
         <p className="text-gray-600 text-black text-justify p-5">{content}</p>
       </div>
       <div className="flex flex-col items-end mt-0 justify-end h-full">
        {content || content &&
    (content.length<50)?
       <button
         onClick={() => handleDeleteNote(id)}
         className="bg-red-300 transparent hover:bg-red-400 text-white px-2 py-2 rounded justify-bottom text-sm"
       >
         🗑 
       </button>:
       <button
       onClick={() => handleDeleteNote(note.id)}
       className="bg-red-300 transparent hover:bg-red-400 text-white px-2 py-2 rounded justify-bottom text-sm"
     >
       🗑 
     </button>}
       </div></>
    
  )
}

             