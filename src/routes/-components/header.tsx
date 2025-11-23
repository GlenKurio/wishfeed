import { Link } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase/auth";

export default function Header() {
  return (
    <div className="bg-card shadow-sm flex p-4 items-center justify-between">
      <div className="h-10">
        <img
          src="/public/logo-full.png"
          alt="WishFeed logo"
          className="w-full h-full"
        />
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
        </ul>
      </nav>
      <div className="justify-self-end">
        <button onClick={async () => signOut(auth)} className="btn">
          Logout
        </button>
      </div>
    </div>
  );
}
