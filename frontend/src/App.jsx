import './App.css'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

function App() {
  return (
    <>
      <h1>Welcome to mySite</h1>
        <SignInButton mode='modal'/>
    </>
  );
}

export default App