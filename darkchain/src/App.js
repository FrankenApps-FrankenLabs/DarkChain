import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Submit from './pages/Submit';
import DAppPage from './pages/DAppPage';
import Admin from './pages/Admin';
import { connectWallet } from './lib/wallet';

export default function App() {
  const [wallet, setWallet] = useState('');
  const [signer, setSigner] = useState(null);
  const signerRef = useRef(null);

  async function handleConnect() {
    try {
      const { address, signer: s } = await connectWallet();
      setWallet(address);
      setSigner(s);
      signerRef.current = s;
    } catch (e) {
      alert(e.message);
    }
  }

  function handleDisconnect() {
    setWallet('');
    setSigner(null);
    signerRef.current = null;
  }

  return (
    <BrowserRouter>
      <Navbar wallet={wallet} onConnect={handleConnect} onDisconnect={handleDisconnect} />
      <Routes>
        <Route path="/" element={<Home wallet={wallet} />} />
        <Route path="/submit" element={
          <Submit
            wallet={wallet}
            setWallet={setWallet}
            setSigner={setSigner}
            signerRef={signerRef}
          />
        } />
        <Route path="/dapp/:id" element={<DAppPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}