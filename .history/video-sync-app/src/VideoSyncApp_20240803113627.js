import React, { useState, useRef, useEffect } from 'react';

function VideoSyncApp() {
    const [verificationCode, setVerificationCode] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const videoPlayerRef = useRef(null);

    useEffect(() => {
        if (videoUrl) {
            videoPlayerRef.current.src = videoUrl;
        }
    }, [videoUrl]);

    const handleConnect = () => {
        fetch('http://localhost:8080/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ verificationCode })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Verification successful, set video URL
                setVideoUrl(data.videoUrl);
                // Establish WebSocket connection for synchronization
                const socket = new WebSocket('ws://localhost:8080');
                socket.onopen = () => {
                    socket.send(JSON.stringify({ verificationCode, action: 'join' }));
                };
                socket.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    if (message.action === 'sync') {
                        // Handle synchronization logic here
                    }
                };
            } else {
                alert('Invalid verification code');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div>
            <iframe ref={videoPlayerRef} src="" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="640" height="480"></iframe>
            <input 
                type="text" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                placeholder="Enter verification code"
            />
            <button onClick={handleConnect}>Connect</button>
        </div>
    );
}

export default VideoSyncApp;