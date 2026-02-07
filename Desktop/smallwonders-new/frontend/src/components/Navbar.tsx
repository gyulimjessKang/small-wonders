import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface Props {
  user: any;
}

export default function Navbar({ user }: Props) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between p-4 backdrop-blur bg-black/20">
      <Link to="/" className="text-xl font-bold">
        Small Wonders
      </Link>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/settings')}
          className="text-2xl hover:opacity-80"
          title="Settings"
        >
          ⚙️
        </button>
        {user && (
          <img
            src={user.photoURL || ''}
            alt="avatar"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => signOut(auth)}
          />
        )}
      </div>
    </header>
  );
} 