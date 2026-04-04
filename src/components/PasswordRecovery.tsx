import React, { useState, useEffect, useRef } from 'react';
import type { ModalProps } from './props';
import { db } from './firebaseConfig';
import '../styles/Modal.css';
import '../styles/PasswordRecovery.css';

type Step = 1 | 2 | 3 | 4;
const totalSteps = 4;

interface FpMessage {
  text: string;
  color: string;
}

const isEmailValid = (val: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
const isPinValid = (val: string) => /^\d{4}$/.test(val);
const isPassValid = (val: string) => /^(?=.*[a-zA-Z])(?=.*[0-9]).{5,15}$/.test(val);

const PasswordRecovery: React.FC<ModalProps> = ({ isOpen, onClose }) => { 
    const [step, setStep] = useState<Step>(1);
    const [playerID, setPlayerID] = useState('');
    const [correctPIN, setCorrectPIN] = useState('');
    
    const [idInput, setIdInput] = useState('');
    const [emailInput, setEmailInput] = useState('');

    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');

    const [pinInput, setPinInput] = useState('');
    const [showPin, setShowPin] = useState(false);

    const [newPass, setNewPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [confirmPass, setConfirmPass] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    
    const [message, setMessage] = useState<FpMessage | null>(null);
    const [done, setDone] = useState(false);
    const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const passValid = isPassValid(newPass);
    const confirmValid = newPass === confirmPass && confirmPass.length > 0;

    useEffect(() => {
        if (window.game?.input?.keyboard){
            isOpen ? window.game.input.keyboard.stopListeners() : window.game.input.keyboard.startListeners();
        }
        return () => window.game?.input?.keyboard?.startListeners();
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setPlayerID('');
            setCorrectPIN('');
            setIdInput('');
            setEmailInput('');
            setVerifying(false);
            setVerifyResult('idle');
            setPinInput('');
            setNewPass('');
            setConfirmPass('');
            setShowPin(false);
            setShowPass(false);
            setShowConfirm(false);
            setMessage(null);
            setDone(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    function showMsg(text: string, color: string) {
        if (messageTimer.current) clearTimeout(messageTimer.current);
        setMessage({ text, color });
        messageTimer.current = setTimeout(() => setMessage(null), 2500);
    }

    function handleProceedToVerify() {
        if (!idInput.trim()) {
            showMsg('Please enter your Player ID.', 'red');
            return;
        }
        
        if (!isEmailValid(emailInput.trim())) {
            showMsg('Please use a valid email (example@email.com)', 'red');
            return;
        }

        setVerifyResult('idle');
        setStep(2);
    }

    async function handleVerifyAccount() {
        setVerifying(true);
        setVerifyResult('checking');
        
        try {
            const snapshot = await db.ref(`webGame/${idInput.trim()}`).once('value');
            const data = snapshot.val();
    
            if (!data) {
                setVerifyResult('fail');
                showMsg('Account not found.', 'red');
                return;
            }
    
            const emailMatches = (data.email ?? '').toLowerCase() === emailInput.trim().toLowerCase();
    
            if (!emailMatches) {
                setVerifyResult('fail');
                showMsg('Email does not match this account.', 'red');
                return;
            }
    
            setVerifyResult('ok');
            setPlayerID(idInput.trim());
            setCorrectPIN(data.pin);
            showMsg('Account verified! Proceeding...', 'green');
            setTimeout(() => setStep(3), 700);
        } catch {
            setVerifyResult('fail');
            showMsg('Error connecting to database.', 'red');
        } finally {
            setVerifying(false);
        }
    }

    function handleVerifyPIN() {
        if (!isPinValid(pinInput)) {
            showMsg('Requires exactly 4 digits.', 'red');
            return;
        }

        if (pinInput !== correctPIN) {
            showMsg('Incorrect PIN.', 'red');
            return;
        }

        showMsg('PIN verified! Proceeding...', 'green');
        setTimeout(() => setStep(4), 700);
    }

    async function handleSavePassword() {
        if (!isPassValid(newPass)) {
            showMsg('Must be 5-15 alphanumeric characters [a-Z, 0-9]', 'red');
            return;
        }
        if (newPass !== confirmPass) {
            showMsg('Passwords must match.', 'red');
            return;
        }
        try {
            await db.ref(`webGame/${playerID}/pass`).set(newPass);
            setDone(true);
        } catch {
            showMsg('Failed to save password.', 'red');
        }
    }

    function handleKeyDown(e: React.KeyboardEvent, action: () => void) { if (e.key === 'Enter') action(); }
 
    const StepIndicator = () => (
        <div className="fpSteps">
            {Array.from({ length: totalSteps }, (_, i) => {
                const num = i + 1;

                return (
                    <React.Fragment key={num}>
                        <div className={`fpStep ${step >= num ? 'active' : ''} ${step > num ? 'done' : ''}`}>
                            {step > num ? '✓' : num}
                        </div>

                        {num < totalSteps && <div className={`fpStepLine ${step > num ? 'done' : ''}`} />}
                    </React.Fragment>
                );
            })}
        </div>
    );
 
    const MessageBanner = () => message ? (<p className="fpMessage" style={{ color: message.color }}>{message.text}</p>) : null;

    return(
        <div className="modalBackdrop">
            <div className="modalContainer">
                <button id="closeButton" onClick={onClose}>X</button>
                
                <div className="modalContent">
                    <section className="passwordRecoveryContainer">
                        <h1 id="mainTitle">PASSWORD RECOVERY</h1>
                        <StepIndicator />

                        {done ? (
                            <div className="fpSuccess">
                                <span className="fpSuccessIcon">✓</span>
                                <h3>Password Updated!</h3>
                                <p>Your password has been reset successfully.</p>
                                <button className="fpBtn" onClick={onClose}>Close</button>
                            </div>
                        ) : step === 1 ? (
                            <div className="fpStep-content">
                                <span className="mainHeader">Recover Password</span>
                                <p className="subHeader">Enter your Player ID and registered email.</p>
                
                                <input className="fpInput"
                                    type="text"
                                    placeholder="Enter your Player ID"
                                    value={idInput}
                                    onChange={e => setIdInput(e.target.value)}
                                    onKeyDown={e => handleKeyDown(e, handleProceedToVerify)}
                                />
                
                                <input className="fpInput"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    onKeyDown={e => handleKeyDown(e, handleProceedToVerify)}
                                />

                                <p className="fpHint" style={{
                                        color: isEmailValid(emailInput)
                                            ? '#cdff77'
                                            : emailInput.length > 0 ? '#ff9090' : '#454545'
                                    }}>
                                    {isEmailValid(emailInput) ? 'Email verified!' : 'Please use a valid email (example@email.com)'}
                                </p>
                
                                <button className="fpBtn" onClick={handleProceedToVerify}>Continue</button>
                                <MessageBanner />
                            </div>
                        ) : step === 2 ? (
                            <div className="fpStep-content">
                                <h3 className="mainHeader">Verifying Account</h3>
                                <p className="subHeader">Checking if <strong>{idInput}</strong> exists and matches your email.</p>
                
                                <div className={`fpVerifyCard ${verifyResult}`}>
                                    <div className="fpVerifyRow">
                                        <span className="fpVerifyLabel">Player ID</span>
                                        <span className="fpVerifyValue">{idInput}</span>
                                    </div>

                                    <div className="fpVerifyRow">
                                        <span className="fpVerifyLabel">Email</span>
                                        <span className="fpVerifyValue">{emailInput}</span>
                                    </div>

                                    <div className="fpVerifyStatus">
                                        {verifyResult === 'idle' && <span className="fpStatusIdle">Waiting to verify...</span>}
                                        {verifyResult === 'checking' && <span className="fpStatusChecking">Checking...</span>}
                                        {verifyResult === 'ok' && <span className="fpStatusOk">Account found!</span>}
                                        {verifyResult === 'fail' && <span className="fpStatusFail">Verification failed</span>}
                                    </div>
                                </div>
                
                                <div className="fpVerifyActions">
                                    <button className="fpBtnSecondary"
                                        onClick={() => { setVerifyResult('idle'); setStep(1); }}
                                    >
                                        ← Back
                                    </button>

                                    <button className="fpBtn" onClick={handleVerifyAccount} disabled={verifying}>
                                        {verifying ? 'Verifying...' : 'Verify Account'}
                                    </button>
                                </div>

                                <MessageBanner />
                            </div>
                        ) : step === 3 ? (
                            <div className="fpStep-content">
                                <h3 className="mainHeader">Verify PIN</h3>
                                <p className="subHeader">Enter the 4-digit PIN for this account.</p>
                
                                <div className="fpInputRow">
                                    <input className="fpInput"
                                        type={showPin ? 'text' : 'password'}
                                        maxLength={4}
                                        placeholder="Enter your 4-digit PIN..."
                                        value={pinInput}
                                        onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={e => handleKeyDown(e, handleVerifyPIN)}
                                    />

                                    <button className="fpToggleBtn"
                                        onClick={() => setShowPin(p => !p)}
                                        aria-label="Toggle PIN visibility"
                                    >
                                        <img
                                            src={`assets/WebAssets/Padlock${showPin ? 'Opened' : 'Closed'}.png`}
                                            alt="Show/Hide PIN"
                                        />
                                    </button>
                                </div>

                                <p className="fpHint" style={{
                                        color: isPinValid(pinInput)
                                            ? '#cdff77'
                                            : pinInput.length > 0 ? '#ff9090' : '#454545'
                                    }}>
                                    {isPinValid(pinInput) ? 'PIN verified!' : 'Requires exactly 4 digits'}
                                </p>
                
                                <button className="fpBtn" onClick={handleVerifyPIN}>Verify PIN</button>
                                <MessageBanner />
                            </div>
                        ) : (
                            <div className="fpStep-content">
                                <span className="mainHeader">Reset Password</span>
                                <p className="subHeader">Enter your new password below.</p>
                
                                <div className="fpInputRow">
                                    <input className="fpInput"
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Enter your Password..."
                                        value={newPass}
                                        onChange={e => setNewPass(e.target.value)}
                                        onKeyDown={e => handleKeyDown(e, handleSavePassword)}
                                    />

                                    <button className="fpToggleBtn"
                                        onClick={() => setShowPass(p => !p)}
                                        aria-label="Toggle password visibility"
                                    >
                                        <img
                                            src={`assets/WebAssets/Padlock${showPass ? 'Opened' : 'Closed'}.png`}
                                            alt="Show/Hide Password"
                                        />
                                    </button>
                                </div>

                                <p className="fpHint" style={{
                                        color: passValid
                                            ? '#cdff77'
                                            : newPass.length > 0 ? '#ff9090' : '#454545'
                                    }}>
                                    {passValid ? 'Password verified!' : 'Must be 5-15 alphanumeric characters [a-Z, 0-9]'}
                                </p>
                
                                <div className="fpInputRow">
                                    <input className="fpInput"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Re-enter your Password..."
                                        value={confirmPass}
                                        onChange={e => setConfirmPass(e.target.value)}
                                        onKeyDown={e => handleKeyDown(e, handleSavePassword)}
                                    />
                                    
                                    <button className="fpToggleBtn"
                                        onClick={() => setShowConfirm(p => !p)}
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        <img
                                            src={`assets/WebAssets/Padlock${showConfirm ? 'Opened' : 'Closed'}.png`}
                                            alt="Show/Hide Password"
                                        />
                                    </button>
                                </div>

                                <p className="fpHint" style={{
                                        color: newPass !== confirmPass
                                            ? '#ff9090'
                                            : confirmPass.length > 0 ? '#cdff77' : '#454545'
                                    }}>
                                    {confirmValid ? 'Passwords match!' : 'Passwords must match'}
                                </p>
                
                                <button className="fpBtn" onClick={handleSavePassword}>Save Password</button>
                                <MessageBanner />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PasswordRecovery;