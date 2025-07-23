import { createPortal } from 'react-dom';

interface Props {
  wonder: {
    id:string;
    text:string;
    createdAt:string;
    category?:string;
  };
  onClose:()=>void;
}

export default function WonderPopup({wonder,onClose}:Props){
  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 text-white rounded max-w-md w-full p-6 space-y-4">
        <h3 className="text-xl font-semibold">{new Date(wonder.createdAt).toLocaleString()}</h3>
        <p className="whitespace-pre-wrap">{wonder.text}</p>
        {wonder.category && <p className="text-sm opacity-70">Category: {wonder.category}</p>}
        <button onClick={onClose} className="px-4 py-2 bg-purple-600 rounded">Close</button>
      </div>
    </div>,
    document.body
  );
} 