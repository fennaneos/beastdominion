import { signInWithGoogle } from "../firebase";

export default function LoginButton() {
  return (
    <button
      onClick={signInWithGoogle}
      style={{
        padding: "10px 20px",
        borderRadius: "10px",
        background: "#ffd27f",
        border: "2px solid #b78b3d",
        fontFamily: "Cinzel, serif",
        cursor: "pointer",
      }}
    >
      Sign in with Google
    </button>
  );
}
