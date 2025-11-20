import LoginButton from "./LoginButton";

export default function LoginScreen() {
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>Beast Dominion</h1>
      <p>Please sign in to continue</p>
      <LoginButton />
      <button
  onClick={() => {
    localStorage.setItem("devUser", "1");
    window.location.reload();
  }}
  style={{ marginTop: "20px", opacity: 0.4 }}
>
  Dev Login (Skip Auth)
</button>

    </div>
  );
}
